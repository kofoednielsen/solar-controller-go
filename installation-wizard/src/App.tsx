import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Stepper from "@mui/material/Stepper";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import useInstall from "./Install";

const steps = [
  {
    label: "Insert SD Card",
    description:
      "Power off your raspberry pi, remove the SD card and plug it into your computer. If you're on windows and you are prompted to format the SD card, press no. Once the SD card is inserted, press Next",
  },
  {
    label: "Installation",
    description:
      'Press the install button below. When prompted to select a directory, select the BOOT partition of the SD card. When prompted for file edit permission, select "Edit files"',
  },
  {
    label: "Boot the pi",
    description:
      "Now the program is installed. Remove the SD from your computer, insert it back into the raspberry pi and power it on. Once it's powered on, press Next",
  },
  {
    label: "Finished",
    description: (
      <p>
        You can now access the web-interface on{" "}
        <a href="https://solar-assistant.local:8080">
          {"https://solar-assistant.local:8080"}
        </a>{" "}
        and finish the configuration. Save this URL for later use when you want
        to adjust your time of use tables
      </p>
    ),
  },
];

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { install, installing, error, done, progress } = useInstall();

  const handleNext = useCallback(() => {
    console.log("ran");
    if (activeStep === 1) {
      install();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [setActiveStep, activeStep, install]);

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const buttonNameMap = ["Next", "Install", "Next", "Finish"];

  useEffect(() => {
    if (done) setActiveStep(s => s+1);
  }, [done, setActiveStep]);

  return (
    <Box p={5} sx={{ flowGrow: 1 }}>
      <Grid justifyContent="center" textAlign="center" container>
        <Grid xs={12} item>
          <Typography mb={3} variant="h4" gutterBottom>
            Solar Controller Installation Wizard <Chip label={process.env.REACT_APP_VERSION}/>
          </Typography>
        </Grid>
        <Grid xs={12} md={4} textAlign="left" item>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Box mt={2} sx={{ width: "100%" }}>
                        {installing && activeStep == 1 ? (
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                          />
                        ) : null}
                        {error && activeStep===1 ? <Alert severity="error">{error}</Alert> : null}
                      </Box>
                      {installing ? null : (
                        <>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            {buttonNameMap[index]}
                          </Button>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Back
                          </Button>
                        </>
                      )}
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper square elevation={0} sx={{ p: 3 }}>
              <Typography>
                All steps completed - you&apos;re finished
              </Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                Reset
              </Button>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default App;
