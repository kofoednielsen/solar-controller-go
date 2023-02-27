import React, { useState, useEffect, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import InputAdornment from "@mui/material/InputAdornment";

type SlotType = {
  point: number;
  voltage: number | undefined;
  grid_charge: boolean;
};

export type TimeOfUseType = {
  id: string;
  threshold: number | undefined;
  slots: Array<SlotType>;
};

const Slot = ({
  slot: { point, voltage, grid_charge },
  updateVoltage,
  updateGridCharge
}: {
  slot: SlotType;
  updateVoltage: (point: number, voltage: number | undefined) => void;
  updateGridCharge: (point: number, value: boolean) => void;
}) => {
  const [voltageStr, setVoltageStr] = useState<string>(voltage?.toString() || "");

  useEffect(() => {
    if (
      voltageStr === "" ||
      Number(voltageStr) > 56 ||
      Number(voltageStr) < 48
    )
      updateVoltage(point, undefined);
    else updateVoltage(point, Number(voltageStr));
  }, [voltageStr, updateVoltage, point]);

  return (
    <TableRow>
      <TableCell align="center">
        <b style={{ fontSize: "15px" }}>{point}</b>
      </TableCell>
      <TableCell align="center">
        <TextField
          type="number"
          size="small"
          error={voltage === undefined}
          value={voltageStr}
          onChange={(e) => setVoltageStr(e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">V</InputAdornment>,
          }}
          style={{ width: "12ch" }}
        />
      </TableCell>
      <TableCell align="center">
        <Checkbox onClick={(e) => updateGridCharge(point, !grid_charge)} checked={grid_charge} />
      </TableCell>
    </TableRow>
  );
};

const TimeOfUse = ({
  timeOfUse: { threshold, slots, id },
  remove,
  updateThreshold,
  updateVoltage,
  updateGridCharge
}: {
  timeOfUse: TimeOfUseType;
  remove: (id: string | undefined) => void;
  updateThreshold: (id: string, threshold: number | undefined) => void;
  updateGridCharge: (id: string, point: number, value: boolean) => void;
  updateVoltage: (
    id: string,
    point: number,
    voltage: number | undefined
  ) => void;
}) => {
  const [thresholdStr, setThresholdStr] = useState<string>(
    threshold?.toString() || ""
  );

  useEffect(() => {
    if (
      thresholdStr === "" ||
      Number(thresholdStr) < 0 ||
      Number(thresholdStr) > 100
    )
      updateThreshold(id, undefined);
    else updateThreshold(id, Number(thresholdStr));
    console.log("hello")
  }, [thresholdStr, updateThreshold, id]);

  const updateVoltageWithId = useCallback(
    (point: number, voltage: number | undefined) =>
      updateVoltage(id, point, voltage),
    [id, updateVoltage]
  );

  return (
    <>
      <Grid item xs={12} md={6} lg={4} xl={3}>
        <Card variant="outlined">
          <Box p={1}>
            <Grid container>
              <Grid item>
                <TextField
                  fullWidth
                  error={threshold === undefined}
                  disabled={threshold === 0}
                  size="small"
                  type="number"
                  label="From cloud coverage"
                  value={thresholdStr}
                  onChange={(e) => setThresholdStr(e.target.value)}
                  placeholder="60"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  style={{ width: "20ch" }}
                />
              </Grid>
              {threshold === 0 ? null : (
                <Grid style={{ margin: "auto", marginRight: "0px" }} item>
                  <IconButton onClick={() => remove(id)} aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              )}
            </Grid>
            <TableContainer
             style={{overflow: "hidden"}}
            >
              <Table aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Slot</TableCell>
                    <TableCell align="center">Voltage</TableCell>
                    <TableCell align="center">Grid charge</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slots.map((slot) => (
                    <Slot
                      updateGridCharge={(point: number, value: boolean) => updateGridCharge(id, point, value)}
                      updateVoltage={updateVoltageWithId}
                      key={slot.point}
                      slot={slot}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      </Grid>
    </>
  );
};

export default TimeOfUse;
