package main

import (
	"encoding/gob"
	"log"
	"os"
)

type Slot struct {
	Point      int     `json:"point"`
	Voltage    float64 `json:"voltage"`
	GridCharge bool    `json:"grid_charge"`
}

type TimeOfUseTable struct {
	ID        string  `json:"id"`
	Slots     []Slot  `json:"slots"`
	Threshold float64 `json:"threshold"`
}

type State struct {
	Lat             float64          `json:"lat"`
	Lon             float64          `json:"lon"`
	TimeOfUseTables []TimeOfUseTable `json:"timeOfUseTables"`
}

var DATABASE_PATH = "database.gob"

func (state *State) Load() {
	dataFile, err := os.Open(DATABASE_PATH)

	if err != nil {
		return
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
