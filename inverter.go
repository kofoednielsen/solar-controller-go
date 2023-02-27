package main

import (
	"fmt"
	"log"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

var f mqtt.MessageHandler = func(client mqtt.Client, msg mqtt.Message) {
	fmt.Printf("TOPIC: %s\n", msg.Topic())
	fmt.Printf("MSG: %s\n", msg.Payload())
}

var client mqtt.Client

func inverter_connect() {
	opts := mqtt.NewClientOptions().AddBroker("tcp://192.168.0.60:1883").SetClientID("solar-controller")
	client = mqtt.NewClient(opts)
	if token := client.Connect(); token.Wait() && token.Error() != nil {
		log.Fatal(token.Error())
	}
}

func inverter_disconnect() {
	client.Disconnect(5000)
}

func set_inverter_time_of_use(category string, point int, value string) {
	token := client.Publish(fmt.Sprintf("solar_assistant/inverter_1/%s_point_%d/set", category, point), 0, false, value)
	token.Wait()
}
