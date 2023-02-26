import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

const WeatherSettings = ({
  updateLat,
  updateLon,
  lat,
  lon,
}: {
  updateLat: (value: number | undefined) => void;
  updateLon: (value: number | undefined) => void;
  lat: number | undefined;
  lon: number | undefined;
}) => {
  const [latStr, setLatStr] = useState<string>(
    lat?.toString() || ""
  );
  const [lonStr, setLonStr] = useState<string>(
    lon?.toString() || ""
  );

  useEffect(() => {
    if (latStr === "" || latStr === "0" || Number(latStr) > 90 || Number(latStr) < -90) updateLat(undefined);
    else updateLat(Number(latStr));
    console.log("hello")
  }, [latStr, updateLat]);

  useEffect(() => {
    if (lonStr === "" || lonStr === "0" || Number(lonStr) > 180 || Number(lonStr) < -180)
      updateLon(undefined);
    else updateLon(Number(lonStr));
  }, [lonStr, updateLon]);

  return (
    <Grid xs={12} item>
      <Card variant="outlined">
        <Box
          p={3}
          sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
          component="form"
        >
          <Typography variant="h5" gutterBottom>
            Weather report settings
          </Typography>
          <TextField
            type="number"
            label="Latitude"
            error={lat === undefined}
            InputLabelProps={{ shrink: true }}
            value={latStr}
            onChange={(e) => setLatStr(e.target.value)}
          />
          <TextField
            type="number"
            label="Longitude"
            error={lon === undefined}
            InputLabelProps={{ shrink: true }}
            value={lonStr}
            onChange={(e) => setLonStr(e.target.value)}
          />
        </Box>
      </Card>
    </Grid>
  );
};

export default WeatherSettings;
