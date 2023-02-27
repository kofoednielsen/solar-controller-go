package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strconv"

	"github.com/robfig/cron/v3"
)

//go:embed frontend/build/index.html
var indexPage []byte

func index(w http.ResponseWriter, req *http.Request) {
	w.WriteHeader(200)
	w.Write(indexPage)
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
	json, err := json.Marshal(state)
	if err != nil {
		log.Fatal(err)
	}
	w.Header().Add("content-type", "application/json")
	w.Write(json)
}

func daily() {
	state := State{}
	state.Load()
	if state.Lat == 0 || state.Lon == 0 {
		return
	}
	todayCloudCoverage := calculate_cloud_average()
	fmt.Printf("Today's cloud coverage is: %f\n", todayCloudCoverage)
	inverter_connect()
	for _, timeOfUseTable := range reverse(state.TimeOfUseTables) {
		if todayCloudCoverage > timeOfUseTable.Threshold {
			for _, slot := range timeOfUseTable.Slots {
				fmt.Printf("Slot %d: Voltage: %f V, Grid Charge: %s\n", slot.Point, slot.Voltage, strconv.FormatBool(slot.GridCharge))
				set_inverter_time_of_use("voltage", slot.Point, fmt.Sprintf("%f", slot.Voltage))
				set_inverter_time_of_use("grid_charge", slot.Point, strconv.FormatBool((slot.GridCharge)))
			}
			break
		}
	}
	inverter_disconnect()
}

func main() {
	c := cron.New()
	c.AddFunc("@every 5m", daily)
	c.Start()
	port := 8080
	fmt.Println("RUNNING")
	http.HandleFunc("/", index)
	http.HandleFunc("/load", load)
	http.HandleFunc("/save", save)
	daily()
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
