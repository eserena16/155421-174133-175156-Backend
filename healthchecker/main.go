package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	http.HandleFunc("/healthcheck", HealthcheckHandler)
	log.Fatal(http.ListenAndServe(":"+getEnv("HEALTH_PORT", "8090"), nil))
}

func HealthcheckHandler(w http.ResponseWriter, r *http.Request) {
	backendURL := getEnv("HEALTH_URL", "http://localhost:8080/api/healthcheck")

	resp, err := http.Get(backendURL)
	if err != nil {
		log.Printf("Error al realizar la solicitud de healthcheck: %s", err)
		http.Error(w, "Error al realizar la solicitud de healthcheck", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		fmt.Fprintln(w, "El servicio de backend está en funcionamiento")
	} else {
		fmt.Fprintln(w, "El servicio de backend no está disponible")
	}
}

func getEnv(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value != "" {
		return value
	}
	return defaultValue
}
