import React, { useState, useEffect, useCallback } from "react";
import {
  _MapContext as MapContext,
  StaticMap,
  NavigationControl,
  ScaleControl,
  FlyToInterpolator,
} from "react-map-gl";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import DeckGL from "@deck.gl/react";
import { useSubscribe, useUnsubscribe } from "@/utils/usePubSub";
import { useInterval } from "ahooks";
import {
  AmbientLight,
  LightingEffect,
  MapView,
  _SunLight as SunLight,
} from "@deck.gl/core";
//redux
import { useMappedState } from "redux-react-hook";

//flowmap
import { FlowmapLayer } from "@flowmap.gl/layers";
import "./index.css";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoieGlhb3RpYW54dCIsImEiOiJjbHc0dzluN2wxNHdnMmpxc2dmdmhhcDAxIn0.O40KeQ23hi4N77iRC7qdGw";

export default function Deckmap() {
  const unsubscribe = useUnsubscribe(); //清除更新组件重复订阅的副作用
  /*
    ---------------redux中取出变量---------------
  */
  //#region
  const mapState = useCallback(
    (state) => ({
      traj: state.traj,
    }),
    []
  );
  const { traj } = useMappedState(mapState);

  const { locations, flows, config, customlayers } = traj;

  //#endregion
  /*
  ---------------地图底图设置---------------
  */
  //#region
  //管理光强度
  const [lightintensity, setlightintensity] = useState(2);
  unsubscribe("lightintensity");
  useSubscribe("lightintensity", function (msg, data) {
    setlightintensity(data);
  });

  //管理光角度X
  const [lightx, setlightx] = useState(1554937300);
  unsubscribe("lightx");
  useSubscribe("lightx", function (msg, data) {
    setlightx(data);
  });

  //地图光效
  const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
  });

  const sunLight = new SunLight({
    timestamp: lightx,
    color: [255, 255, 255],
    intensity: lightintensity,
  });
  const lightingEffect = new LightingEffect({ ambientLight, sunLight });

  const material = {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 22,
    specularColor: [60, 64, 70],
  };

  const theme = {
    buildingColor: [255, 255, 255],
    trailColor0: [253, 128, 93],
    trailColor1: [23, 184, 190],
    material,
    effects: [lightingEffect],
  };

  //设定默认地图中心点
  const [viewState, setViewState] = React.useState({
    longitude: 139.691,
    latitude: 35.6011,
    zoom: 11,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    //允许右键旋转视角
    document
      .getElementById("deckgl-wrapper")
      .addEventListener("contextmenu", (evt) => evt.preventDefault());
  }, []);

  //#endregion
  /*
  ---------------地图旋转按钮---------------
  */
  //#region
  //旋转的函数
  function rotate(pitch, bearing, duration) {
    setViewState({
      ...viewState,
      pitch: pitch,
      bearing: bearing,
      transitionDuration: duration,
      transitionInterpolator: new FlyToInterpolator(),
    });
  }
  const [angle, setangle] = useState(120);
  const [interval, setInterval] = useState(undefined);
  useInterval(
    () => {
      rotate(viewState.pitch, angle, 2000);
      setangle((angle) => angle + 30);
    },
    interval,
    { immediate: true }
  );
  //旋转的按钮
  function rotatecam() {
    console.log(customlayers);
    setangle(viewState.bearing + 30);
    if (interval !== 2000) {
      setInterval(2000);
    } else {
      setInterval(undefined);
      setViewState(viewState);
    }
  }
  //镜头旋转工具
  const cameraTools = (
    <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
      <button
        title="Rotatecam"
        onClick={rotatecam}
        style={{ opacity: interval === 2000 ? 1 : 0.2 }}
      >
        {" "}
        <span className="iconfont icon-camrotate" />
      </button>
    </div>
  );

  useEffect(() => {
    if (locations.length > 0) {
      setViewState({
        ...viewState,
        longitude: locations[parseInt(locations.length / 2)].lon,
        latitude: locations[parseInt(locations.length / 2)].lat,
      });
    }
  }, [locations, viewState]);
  function getTooltipText(info) {
    if (!info.layer) {
    } else {
      if (info.layer.id === "OD") {
        if (info.object) {
          if (info.object.type === "flow") {
            return `Count: ${info.object.count}`;
          }
          if (info.object.type === "location") {
            return `In: ${info.object.totals.incomingCount}\nOut: ${info.object.totals.outgoingCount}`;
          }
        }
      }
    }
  }
  const getTooltip = useCallback((info) => getTooltipText(info), []);

  //#endregion
  /*
  ---------------地图图层设置---------------
  */
  const layers = [
    ...customlayers,
    new FlowmapLayer({
      id: "OD",
      data: { locations, flows },
      opacity: config.opacity,
      pickable: true,
      colorScheme: config.colorScheme,
      clusteringEnabled: config.clusteringEnabled,
      clusteringAuto: config.clusteringAuto,
      clusteringLevel: config.clusteringLevel,
      animationEnabled: config.animationEnabled,
      locationTotalsEnabled: config.locationTotalsEnabled,
      fadeOpacityEnabled: config.fadeOpacityEnabled,
      fadeEnabled: config.fadeEnabled,
      fadeAmount: config.fadeAmount,
      darkMode: config.darkMode,
      getFlowMagnitude: (flow) => flow.count || 0,
      getFlowOriginId: (flow) => flow.origin,
      getFlowDestId: (flow) => flow.dest,
      getLocationId: (loc) => loc.id,
      getLocationLat: (loc) => loc.lat,
      getLocationLon: (loc) => loc.lon,
      getLocationCentroid: (location) => [location.lon, location.lat],
    }),
  ];
  //#endregion
  /*
  ---------------渲染地图---------------
  */
  //#region
  const onViewStateChange = (newviewState) => {
    const { viewId } = newviewState;
    const nviewState = newviewState.viewState;
    if (viewId === "firstPerson") {
      setViewState({
        ...viewState,
        longitude: nviewState.longitude,
        latitude: nviewState.latitude,
        bearing: nviewState.bearing,
      });
    } else if (viewId === "baseMap") {
      setViewState({
        ...viewState,
        longitude: nviewState.longitude,
        latitude: nviewState.latitude,
        pitch: nviewState.pitch,
        bearing: nviewState.bearing,
        zoom: nviewState.zoom,
      });
    }
  };
  return (
    <div>
      <DeckGL
        layers={layers}
        initialViewState={{
          baseMap: viewState,
          firstPerson: {
            ...viewState,
            pitch: 0,
            zoom: 0,
            position: [0, 0, 2],
            transitionDuration: undefined,
            transitionInterpolator: undefined,
          },
        }}
        effects={theme.effects}
        controller={{
          doubleClickZoom: false,
          inertia: true,
          touchRotate: true,
        }}
        style={{ zIndex: 0 }}
        ContextProvider={MapContext.Provider}
        onViewStateChange={onViewStateChange}
        getTooltip={getTooltip}
      >
        <MapView
          id="baseMap"
          controller={true}
          y="0%"
          height="100%"
          position={[0, 0, 0]}
        >
          <StaticMap
            reuseMaps
            key="mapboxgl-ctrl-bottom-left"
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
            mapStyle={`mapbox://styles/xiaotianxt/clw4vw5w602m101qz27tycgcs`}
            preventStyleDiffing={true}
          >
            <div
              className="mapboxgl-ctrl-bottom-left"
              style={{ bottom: "20px" }}
            >
              <ScaleControl maxWidth={100} unit="metric" />
            </div>
          </StaticMap>
          <div
            className="mapboxgl-ctrl-bottom-right"
            style={{ bottom: "80px" }}
          >
            <NavigationControl
              onViewportChange={(viewport) => setViewState(viewport)}
            />
            {cameraTools}
          </div>
        </MapView>
      </DeckGL>
    </div>
  );
}
//#endregion
