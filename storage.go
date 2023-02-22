package main

import (
	"encoding/gob"
	"log"
	"os"
)

type State struct {
	Lat float64
	Lon float64
}

var DATABASE_PATH = "database.gob"

func (state *State) Load() {
	dataFile, err := os.Open(DATABASE_PATH)

	if err != nil {
		log.Fatal(err)
	}

	dataDecoder := gob.NewDecoder(dataFile)
	err = dataDecoder.Decode(&state)

	if err != nil {
		log.Fatal(err)
	}

	dataFile.Close()
}

func (state *State) Save() {
	dataFile, err := os.Create(DATABASE_PATH)

	if err != nil {
		log.Fatal(err)
	}

	dataEncoder := gob.NewEncoder(dataFile)
	dataEncoder.Encode(state)

	dataFile.Close()
}
