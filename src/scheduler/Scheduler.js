import React, {useState, useRef, useEffect} from 'react';
import {DayPilot, DayPilotScheduler} from "daypilot-pro-react";
import Zoom from "./Zoom";

const Scheduler = ({version} = {}) => {
  const getEventData = (from, to) => {
    const events = [];

    // generate 10 new events
    for (let i = 0; i < 10; i++) {
        const duration = Math.floor(Math.random() * 6) + 1; // 1 to 6
        const startOffset = Math.floor(Math.random() * 6) + 1; // 1 to 6

        const start = from.addDays(startOffset);
        const end = start.addDays(duration);

        const event = {
            start: start,
            end: end,
            id: DayPilot.guid(),
            resource: String.fromCharCode(65 + i),
            text: "Event"
        };

        events.push(event);
    }

    return events;
}


  const [config, setConfig] = useState({
    days: 200,
    scale: "CellDuration",
    cellDuration: 60,
    companyStartEndTimes: {
      "startMinute": 0,
      "endMinute": 0,
      "startDay": 7,
      "endDay": 22
    },
    businessBeginsHour: 5,
    businessEndsHour: 20,
    showNonBusiness: false,
    timeHeaders: [
        { groupBy: "Day", format: "dddd, MMMM d, yyyy" }, // Day header
      { groupBy: "Hour", format: "h tt"} // Hour header
    ],
    treeEnabled: true,
    resources: [
      {
        name: "Locations", id: "G1", expanded: true, children: [
          {name: "Room 1", id: "A"},
          {name: "Room 2", id: "B"},
          {name: "Room 3", id: "C"},
          {name: "Room 4", id: "D"}
        ]
      },
      {
        name: "People", id: "G2", expanded: true, children: [
          {name: "Person 1", id: "E"},
          {name: "Person 2", id: "F"},
          {name: "Person 3", id: "G"},
          {name: "Person 4", id: "H"}
        ]
      },
      {
        name: "Tools", id: "G3", expanded: true, children: [
          {name: "Tool 1", id: "I"},
          {name: "Tool 2", id: "J"},
          {name: "Tool 3", id: "K"},
          {name: "Tool 4", id: "L"}
        ]
      },
    ],
    treePreventParentUsage: true,
    scrollDelayEvents: 0,
    infiniteScrollingEnabled: true,
    infiniteScrollingStepDays: 100,

    rectangleSelectMode: 'Free',
    rectangleSelectHandling: 'EventSelect',
    onGridMouseDown: args => {
        args.action = 'RectangleSelect';
    },

    dynamicLoading: true,
    onScroll: async args => {
      console.log('\n');
      console.group('onScroll');

      console.groupEnd();

      args.async = true;

      // simulating a server-side call
      setTimeout(() => {
        args.events = getEventData(args.viewport.start, args.viewport.end);
        args.loaded();
      }, 1000);
    },
  });

  const schedulerRef = useRef();

  const getScheduler = () => schedulerRef.current.control;

  const zoomChange = (args) => {
    switch (args.level) {
      case "month":
        setConfig({
          ...config,
          startDate: DayPilot.Date.today().firstDayOfMonth(),
          days: DayPilot.Date.today().daysInMonth(),
          scale: "Day"
        });
        break;
      case "week":
        setConfig({
          ...config,
          startDate: DayPilot.Date.today().firstDayOfWeek(),
          days: 7,
          scale: "Day"
        });
        break;
      default:
        throw new Error("Invalid zoom level");
    }
  };

  const cellWidthChange = (ev) => {
    const checked = ev.target.checked;
    setConfig(prevConfig => ({
      ...prevConfig,
      cellWidthSpec: checked ? "Auto" : "Fixed"
    }));
  };

  const loadData = (args) => {
    const resources = [
      {
        name: "Convertible", id: "G2", expanded: true, children: [
          {name: "MINI Cooper", seats: 4, doors: 2, transmission: "Automatic", id: "A"},
          {name: "BMW Z4", seats: 4, doors: 2, transmission: "Automatic", id: "B"},
          {name: "Ford Mustang", seats: 4, doors: 2, transmission: "Automatic", id: "C"},
          {name: "Mercedes-Benz SL", seats: 2, doors: 2, transmission: "Automatic", id: "D"},
        ]
      },
      {
        name: "SUV", id: "G1", expanded: true, children: [
          {name: "BMW X1", seats: 5, doors: 4, transmission: "Automatic", id: "E"},
          {name: "Jeep Wrangler", seats: 5, doors: 4, transmission: "Automatic", id: "F"},
          {name: "Range Rover", seats: 5, doors: 4, transmission: "Automatic", id: "G"},
        ]
      },
    ];

    const events = [
      {id: 101, text: "Reservation 101", start: "2023-11-02T00:00:00", end: "2023-11-05T00:00:00", resource: "A"},
      {id: 102, text: "Reservation 102", start: "2023-11-06T00:00:00", end: "2023-11-10T00:00:00", resource: "A"},
      {
        id: 103,
        text: "Reservation 103",
        start: "2023-11-03T00:00:00",
        end: "2023-11-10T00:00:00",
        resource: "C",
        backColor: "#6fa8dc",
        locked: true
      },
      {
        id: 104,
        text: "Reservation 104",
        start: "2023-11-02T00:00:00",
        end: "2023-11-08T00:00:00",
        resource: "E",
        backColor: "#f6b26b",
        plus: true
      },
      {
        id: 105,
        text: "Reservation 105",
        start: "2023-11-03T00:00:00",
        end: "2023-11-09T00:00:00",
        resource: "G",
      },
      {
        id: 106,
        text: "Reservation 106",
        start: "2023-11-02T00:00:00",
        end: "2023-11-07T00:00:00",
        resource: "B",
      },
    ];

    getScheduler().update({
      resources,
      events
    });
  }

  useEffect(() => {
    loadData();
  }, []);
  
  return (
    <div>
      <div className="toolbar">
        <Zoom onChange={args => zoomChange(args)}/>
        <button onClick={ev => getScheduler().message("Welcome!")}>Welcome!</button>
        <span className="toolbar-item"><label><input type="checkbox" checked={config.cellWidthSpec === "Auto"}
                                                     onChange={ev => cellWidthChange(ev)}/> Auto width</label></span>
      </div>
      <DayPilotScheduler
        {...config}
        ref={schedulerRef}
      />
    </div>
  );
}

export default Scheduler;
