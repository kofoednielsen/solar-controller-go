package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
)

func index(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, "Hello")
}

func load(w http.ResponseWriter, req *http.Request) {
	state := State{}
	state.Load()
	json, err := json.Marshal(state)
	if err != nil {
		log.Fatal(err)
	}
	w.Header().Add("content-type", "application/json")
	w.Write(json)
}

func save(w http.ResponseWriter, req *http.Request) {
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		log.Fatal(err)
	}
	state := State{}
	err = json.Unmarshal(body, &state)
	state.Save()
	io.WriteString(w, "Saved")
}

func main() {
	fmt.Println(calculate_cloud_average())
	port := 8080
	fmt.Println("RUNNING")
	http.HandleFunc("/", index)
	http.HandleFunc("/load", load)
	http.HandleFunc("/save", save)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
