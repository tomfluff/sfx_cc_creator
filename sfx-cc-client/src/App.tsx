import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { Box, Button, Container, Typography } from "@mui/material";
import { WaveSurfer, WaveForm, Region } from "wavesurfer-react";
import { Stack } from "@mui/system";
import { RegionProps } from "wavesurfer-react/dist/components/Region";

const RegionsPlugin = require("wavesurfer.js/dist/plugin/wavesurfer.regions");
const TimelinePlugin = require("wavesurfer.js/dist/plugin/wavesurfer.timeline");
const MiniMapPlugin = require("wavesurfer.js/dist/plugin/wavesurfer.minimap");

const videoSrc = "/video.mp4";

const plugins = [
  {
    plugin: RegionsPlugin,
    options: { dragSelection: true },
  },
  {
    plugin: TimelinePlugin,
    options: {
      container: "#timeline",
    },
  },
  { plugin: MiniMapPlugin, options: {} },
];

function App() {
  const wavesurferRef = useRef<WaveSurfer>(null!);
  const videoRef = useRef<HTMLVideoElement>(null!);

  const play = useCallback(() => {
    wavesurferRef.current.playPause();
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  const [regions, setRegions] = useState<RegionProps[]>([]);
  const regionsRef = useRef<RegionProps[]>(regions);

  useEffect(() => {
    regionsRef.current = regions;
    console.log("regions changed: regions -> ", regionsRef.current);
  }, [regions]);

  const handleRegionCreate = useCallback(
    (region: RegionProps) => {
      console.log("region created: region -> ", region);
      region.color = "rgba(255, 0, 0, .5)";
      region.attributes = {
        ...region.attributes,
        label: `Region ${region.id}`,
      };
      setRegions([
        ...regionsRef.current,
        {
          ...region,
        },
      ]);
    },
    [regionsRef]
  );

  const handleRegionUpdateEnd = useCallback(
    (region: RegionProps, e: MouseEvent) => {
      console.log("region-update-end --> region:", region);
      console.log(e);
    },
    []
  );

  const handleOnWaveSurferMount = useCallback(
    (waveSurfer: WaveSurfer | null) => {
      if (waveSurfer === null) {
        console.log("Something wrong with WaveSurfer...");
        return;
      }

      wavesurferRef.current = waveSurfer;
      if (wavesurferRef.current) {
        if (videoRef === null) {
          return;
        }
        wavesurferRef.current.load(videoRef.current);

        wavesurferRef.current.on("loading", (data) => {
          console.log("loading --> ", data);
        });
        wavesurferRef.current.on("ready", () => {
          console.log("WaveSurfer is ready");
        });
        wavesurferRef.current.on("seek", (data) => {
          videoRef.current.currentTime = data * videoRef.current.duration;
          console.log("new index ", data);
        });
        wavesurferRef.current.on("region-created", handleRegionCreate);
        wavesurferRef.current.on("region-removed", (region: RegionProps) => {
          console.log("region removed: region -> ", region);
        });
      }
    },
    [handleRegionCreate]
  );

  // App Component

  return (
    <div className="App">
      <Container>
        <Typography variant="h1">Caption Creator</Typography>
        <Box>
          <Box component="div" className="video-container">
            <video ref={videoRef} src={videoSrc} muted />
          </Box>
          <Box mb={2}>
            <WaveSurfer plugins={plugins} onMount={handleOnWaveSurferMount}>
              <Box component="div" id="timeline" />
              <WaveForm
                id="waveform"
                forceDecode={true}
                pixelRatio={1}
                normalize={true}
                scrollParent={true}
              >
                {regions.map((regionProps) => {
                  console.log("region element -> ", regionProps);
                  return (
                    <Region
                      onUpdateEnd={handleRegionUpdateEnd}
                      key={regionProps.id}
                      {...regionProps}
                    />
                  );
                })}
              </WaveForm>
            </WaveSurfer>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={play}>
              Play / Pause
            </Button>
          </Stack>
        </Box>
      </Container>
    </div>
  );
}

export default App;
