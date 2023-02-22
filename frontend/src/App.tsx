import React, { useState, useEffect } from "react";
import { InputNumber, Row, Col, Button, Card, Form, Typography } from "antd";
const { Title } = Typography;

function App() {
  const [lat, setLat] = useState<number | null>();
  const [lon, setLon] = useState<number | null>();

  const [form] = Form.useForm();

  useEffect(() => {
    fetch("/load")
      .then((r) => r.json())
      .then((data) => {
        setLat(data.Lat);
        setLon(data.Lon);
      });
  }, []);

  const save = async () => {
    await fetch("/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lat, lon }),
    });
  };

  return (
    <>
      <Card>
        <Form layout="vertical" form={form}>
          <Form.Item>
            <Title level={4}>Weather forecast settings</Title>
          </Form.Item>
          <Form.Item label="Latitude">
            <InputNumber size="large" value={lat} onChange={setLat} />
          </Form.Item>
          <Form.Item label="Longitude">
            <InputNumber size="large" value={lon} onChange={setLon} />
          </Form.Item>
          <Form.Item>
            <Button onClick={save} size="large" type="primary">
              save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}

export default App;
