package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

type ContactRequest struct {
	Name    string `json:"name" binding:"required,min=2"`
	Email   string `json:"email" binding:"required,email"`
	Message string `json:"message" binding:"required,min=10"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Timestamp string `json:"timestamp"`
	Uptime    string `json:"uptime"`
}

var startTime = time.Now()

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), corsMiddleware())

	api := r.Group("/api/v1")
	{
		api.GET("/health", healthHandler)
		api.POST("/contact", contactHandler)
		api.GET("/stats", statsHandler)
	}

	log.Printf("Backend sidecar starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := os.Getenv("ALLOWED_ORIGIN")
		if origin == "" {
			origin = "http://localhost:4321"
		}
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:    "ok",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Uptime:    time.Since(startTime).Round(time.Second).String(),
	})
}

func contactHandler(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// In production: send email, store in DB, push to queue, etc.
	log.Printf("Contact form: name=%s email=%s message_len=%d", req.Name, req.Email, len(req.Message))

	c.JSON(http.StatusOK, gin.H{
		"message": "Thank you for reaching out. I'll get back to you soon.",
	})
}

func statsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"projects":   3,
		"blog_posts": 2,
		"events":     3,
		"uptime":     time.Since(startTime).Round(time.Second).String(),
	})
}
