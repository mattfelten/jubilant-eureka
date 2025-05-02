package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"connectrpc.com/connect"
	"connectrpc.com/grpcreflect"
	"connectrpc.com/validate"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"golang.org/x/sync/errgroup"

	"github.com/redpanda-data/takehome-ux-team/backend/middleware"
	"github.com/redpanda-data/takehome-ux-team/backend/protogen/redpanda/takehome/api/v1/apiv1connect"
	"github.com/redpanda-data/takehome-ux-team/backend/service/log"
)

// Application is the gRPC server along with all its required dependencies to serve
// the API.
type Application struct {
	validationInterceptor *validate.Interceptor
	server                *http.Server
}

// NewApplication creates a new application.
func NewApplication() *Application {
	return &Application{}
}

func (app *Application) Run(ctx context.Context) error {
	if err := app.initProtoValidator(); err != nil {
		return fmt.Errorf("failed to initialize proto validator: %w", err)
	}

	app.server = &http.Server{
		Addr:              "0.0.0.0:8080",
		Handler:           h2c.NewHandler(app.routes(), &http2.Server{}),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       5 * time.Minute,
		WriteTimeout:      5 * time.Minute,
		MaxHeaderBytes:    8 * 1024, // 8KiB
	}

	// Setup err group. If any of the go routines return an error, it will also
	// cancel the context that is passed to all the other go routines.
	grp, groupCtx := errgroup.WithContext(ctx)
	grp.Go(app.runServer)
	grp.Go(func() error {
		<-groupCtx.Done()

		shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		//nolint:contextcheck // We want a decouple context for the shutdown.
		// Parent context is already cancelled when this code is executed.
		app.Stop(shutdownCtx)
		return nil
	})

	if err := grp.Wait(); err != nil {
		return fmt.Errorf("running the server returned an error: %w", err)
	}

	return nil
}

// Stop the server gracefully.
func (app *Application) Stop(ctx context.Context) {
	slog.Info("initiated graceful shutdown")
	defer slog.Info("graceful shutdown completed")

	if err := app.server.Shutdown(ctx); err != nil {
		slog.Error("failed to shutdown HTTP server", slog.String("error", err.Error()))
	}
}

func (app *Application) initProtoValidator() error {
	validationInterceptor, err := validate.NewInterceptor()
	if err != nil {
		return err
	}
	app.validationInterceptor = validationInterceptor
	return nil
}

func (app *Application) runServer() error {
	slog.Info("started HTTP server", slog.String("address", app.server.Addr))

	err := app.server.ListenAndServe()

	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}

	slog.Error("HTTP server stopped unexpectedly", slog.String("error", err.Error()))
	return err
}

func (app *Application) routes() http.Handler {
	// 1. Create all services for our different APIs
	logService := &log.Service{}

	// With server reflection enabled, ad-hoc debugging tools can call your gRPC-compatible
	// handlers and print the responses without a copy of the proto schema.
	reflector := grpcreflect.NewStaticReflector(apiv1connect.LogServiceName)

	// 2. Register interceptors
	commonInterceptors := connect.WithInterceptors(app.validationInterceptor)

	// 3. Create API with all our services
	mux := http.NewServeMux()
	mux.Handle(grpcreflect.NewHandlerV1(reflector))
	mux.Handle(grpcreflect.NewHandlerV1Alpha(reflector))
	mux.Handle(apiv1connect.NewLogServiceHandler(logService, commonInterceptors))

	// 4. Setup middlewares
	cors := middleware.NewCORS()

	handler := middleware.Chain(mux, cors)

	return handler
}
