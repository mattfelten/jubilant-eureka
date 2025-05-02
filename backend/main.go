package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	go func() {
		<-ctx.Done()
		slog.Info("received signal")
	}()
	srv := NewApplication()

	// 4. Start server. The server will watch for context cancellation and initiate
	// a clean server shutdown and stops all its own managed dependencies.
	err := srv.Run(ctx)
	if err != nil {
		slog.Error("server stopped with an error", slog.String("error", err.Error()))
		os.Exit(1)
	}
}
