import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TimeOfUse, { TimeOfUseType } from "./TimeOfUse";
import WeatherSettings from "./WeatherSettings";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [lat, setLat] = useState<number>();
  const [lon, setLon] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [NetworkError, setNeworkError] = useState<boolean>(false);
  const [lastKnownServerState, setLastKnownServerState] =
    useState<Array<TimeOfUseType>>();
  const [timeOfUseTables, setTimeOfUseTables] = useState<Array<TimeOfUseType>>(
    []
  );

  const emptyTimeOfUseTable = (threshold?: number): TimeOfUseType => ({
    id: uuidv4(),
    slots: [1, 2, 3, 4, 5, 6].map((p) => ({
      point: p,
      voltage: 48,
      grid_charge: true,
    })),
    threshold: threshold,
  });

  useEffect(() => {
    fetch("/load")
      .then((r) => r.json())
      .then((data) => {
        setLat(data.lat);
        setLon(data.lon);
        if (data.timeOfUseTables?.length > 0) {
          setTimeOfUseTables(data.timeOfUseTables);
          setLastKnownServerState(data);
        } else {
          setTimeOfUseTables([emptyTimeOfUseTable(0)]);
        }
        setLoading(false);
      }).catch((e) => setNeworkError(true));
  }, []);

  const timeOfUseSort = useCallback((tables: Array<TimeOfUseType>) => {
    const undefToMaxValue = (val: number | undefined) =>
      val === undefined ? Number.MAX_VALUE : Number(val);
    return tables.sort(
      (a, b) => undefToMaxValue(a.threshold) - undefToMaxValue(b.threshold)
    );
  }, []);

  const updateThreshold = useCallback(
    (id: string, threshold: number | undefined) => {
      setTimeOfUseTables((timeOfUseTables) => {
        const old = timeOfUseTables.find((t) => t.id === id);
        if (!old) return [];
        const others = timeOfUseTables.filter((t) => t.id !== id);
        if (threshold && others.map((o) => o.threshold).includes(threshold))
          return timeOfUseTables;

        const updated = {
          id,
          slots: old.slots,
          threshold,
        };
        return timeOfUseSort([...others, updated]);
      });
    },
    [setTimeOfUseTables, timeOfUseSort]
  );

  const updateVoltage = useCallback(
    (id: string, point: number, voltage: number | undefined) => {
      setTimeOfUseTables((timeOfUseTables) => {
        const old = timeOfUseTables.find((t) => t.id === id);
        if (!old) return [];
        const updated = {
          id,
          slots: [
            ...old.slots.filter((s) => s.point !== point),
            {
              point,
              voltage,
              grid_charge:
                old.slots.find((s) => s.point === point)?.grid_charge || false,
            },
          ].sort((a, b) => a.point - b.point),
          threshold: old.threshold,
        };
        const others = timeOfUseTables.filter((t) => t.id !== id);
        return timeOfUseSort([...others, updated]);
      });
    },
    [setTimeOfUseTables, timeOfUseSort]
  );

  const updateGridCharge = (
    id: string,
    point: number,
    grid_charge: boolean
  ) => {
    setTimeOfUseTables((timeOfUseTables) => {
      const old = timeOfUseTables.find((t) => t.id === id);
      if (!old) return [];
      const updated = {
        id,
        slots: [
          ...old.slots.filter((s) => s.point !== point),
          {
            point,
            voltage: old.slots.find((s) => s.point === point)?.voltage || 48,
            grid_charge,
          },
        ].sort((a, b) => a.point - b.point),
        threshold: old.threshold,
      };
      const others = timeOfUseTables.filter((t) => t.id !== id);
      return timeOfUseSort([...others, updated]);
    });
  };

  const remove = (id: string | undefined) => {
    setTimeOfUseTables(timeOfUseTables.filter((t) => t.id !== id));
  };

  const inputError =
    lat === undefined ||
    lon === undefined ||
    timeOfUseTables.some(
      (t) =>
        t.threshold === undefined ||
        t.slots.some((s) => s.voltage === undefined)
    );

  const saved = JSON.stringify(lastKnownServerState) === JSON.stringify({lat, lon, timeOfUseTables: timeOfUseTables})

  const save = async () => {
    await fetch("/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lat, lon, timeOfUseTables }),
    }).then((r) => r.json()).then(data =>{
      setLastKnownServerState(data);
    }
    );
  };

  const add = () => {
    setTimeOfUseTables(
      timeOfUseSort([...timeOfUseTables, emptyTimeOfUseTable()])
    );
  };

  if (NetworkError) return <Box p={2}><p>Network error, sorry 😥</p></Box>
  if (loading) return null
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid justifyContent="center" container>
        <Grid xs={12} lg={8} m={2} mt={4} item>
          <Grid spacing={2} container>
            <Grid xs={12} mx={2} item>
              <Typography variant="h5" gutterBottom>
                Solar Controller <Chip label={process.env.REACT_APP_VERSION}/>
              </Typography>
            </Grid>
            <WeatherSettings
              lat={lat}
              lon={lon}
              updateLat={setLat}
              updateLon={setLon}
            />
            <Grid xs={12} item>
              <Card variant="outlined">
                <Box
                  p={3}
                  sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
                  component="form"
                >
                  <Typography variant="h5" gutterBottom>
                    Time of use
                  </Typography>
                  <Grid spacing={2} container>
                    {timeOfUseTables.map((t) => (
                      <TimeOfUse
                        updateThreshold={updateThreshold}
                        updateVoltage={updateVoltage}
                        updateGridCharge={updateGridCharge}
                        remove={remove}
                        timeOfUse={t}
                        key={t.id}
                      />
                    ))}
                    <Grid xs={12} md={6} lg={4} xl={3} item>
                      <Button
                        onClick={add}
                        style={{ width: "100%" }}
                        size="large"
                        variant="outlined"
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
            <Grid xs={12} md={4} lg={2} mb={1} item>
                <Button
                  fullWidth
                  disabled={
                    inputError || saved
                  }
                  onClick={save}
                  size="large"
                  variant="contained"
                >
                  {saved 
                    ? "Saved"
                    : "Save"}
                </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
