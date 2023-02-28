import React, { useState, useEffect, useCallback } from "react";

const INIT_SCRIPT =
  'init=/bin/sh -- -c "mount -t proc proc /proc; mount -t sysfs sys /sys; mount /boot; mount / -o remount,rw; /bin/python3 /boot/init.py; exec /sbin/init';

const writeFile = async (
  fileHandle: FileSystemFileHandle,
  contents: string | Blob
) => {
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
};
const readFile = async (fileHandle: FileSystemFileHandle) => {
  const file = await fileHandle.getFile();
  return await file.text();
};

const useInstall = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (error || done) setInstalling(false);
  }, [error, done]);

  const install = useCallback(async () => {
    setProgress(0);
    setDone(false);
    setError(undefined);
    try {
      let cmdLine: FileSystemFileHandle;
      let dirHandle: FileSystemDirectoryHandle;
      try {
        dirHandle = await window.showDirectoryPicker({
          mode: "readwrite",
        });
        setInstalling(true);
        cmdLine = await dirHandle.getFileHandle("cmdLine.txt");
      } catch (e) {
        setError(
          "Error: Please make sure to select the BOOT partition of the SD card"
        );
        return;
      }
      let cmdLineContent = (await readFile(cmdLine)).replace("\n", "");
      if (cmdLineContent.includes("init=")) {
        cmdLineContent = cmdLineContent.replace(/init=.+/, INIT_SCRIPT);
      } else {
        cmdLineContent += " " + INIT_SCRIPT;
        setError(
          "You must boot the raspberry pi at least once before running this installer."
        );
        return;
      }
      await writeFile(cmdLine, cmdLineContent);
      console.log("DONE updating cmdLine.txt");
      setProgress(20);

      const downloadFileToUsb = async (filename: string) => {
        let r = await fetch("/" + filename);
        if (r?.status !== 200) setError(`Failed to download installation file ${filename}`)
        let blob = await r.blob();
        const fileHandle = await dirHandle.getFileHandle(filename, {
          create: true,
        });
        await writeFile(fileHandle, blob);
        console.log(`DONE downloading ${filename}`);
      };
      await downloadFileToUsb("init.py");
      setProgress(40);
      await downloadFileToUsb("solar-controller.service");
      setProgress(60);
      await downloadFileToUsb("solar-controller");
      setProgress(100);
      setDone(true);
    } catch (e) {
      setError(
        `An unexpected error occured. Please make sure you're on a new version of chrome browser: ${e}`
      );
      return;
    }
  }, [setDone, setProgress, setError]);

  return { install, installing, done, error, progress };
};

export default useInstall;
