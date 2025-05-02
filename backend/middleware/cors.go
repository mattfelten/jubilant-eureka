// Package middleware defines HTTP middlewares that span HTTP and ConnectRPC requests.
package middleware

import (
	"net/http"

	connectcors "connectrpc.com/cors"
	"github.com/rs/cors"
)

// NewCORS returns a middleware that applies the given CORS settings.
func NewCORS() func(http.Handler) http.Handler {
	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: connectcors.AllowedMethods(),
		AllowedHeaders: []string{"*"},
		ExposedHeaders: connectcors.ExposedHeaders(),
	})

	return func(next http.Handler) http.Handler {
		return corsHandler.Handler(next)
	}
}
