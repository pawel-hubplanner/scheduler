import React, {useState, useRef, useEffect} from 'react';
import {DayPilot, DayPilotScheduler} from "daypilot-pro-react";
import Zoom from "./Zoom";

let id = 1;

const events = new Array(12).fill(0).reduce((acc, elem, indx) => {

  let temp = [];

  const from = new DayPilot.Date(`2024-${indx < 10 ? `0${indx}` : indx}-01`);

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
      text: `Event ${id}`
    };
    id = id + 1;
    temp.push(event);
  }

  return acc.concat(temp);
}, [])


const Scheduler = ({version} = {}) => {
  const getEventData = (from, to) => {
    return events.filter(event => {
      return event.end > from.addDays(-10) && event.start < to.addDays(10);
    })
}


  const schedulerRef = useRef();

  const getScheduler = () => schedulerRef.current.control;

  const [config, setConfig] = useState({
    days: 200,
    scale: "Day",
    cellDuration: 60,
    cellWidth: 100,
    companyStartEndTimes: {
      "startMinute": 0,
      "endMinute": 0,
      "startDay": 7,
      "endDay": 22
    },
    businessBeginsHour: 5,
    businessEndsHour: 20,
    showNonBusiness: true,
    timeHeaders: [
        { groupBy: "Day", format: "MMMM d" }, // Day header
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

    multiMoveVerticalMode: 'All',
    rectangleSelectMode: 'Free',
    rectangleSelectHandling: 'EventSelect',
    allowMultiMove: true,
    eventClickHandling: 'Select',
    onGridMouseDown: args => {
        args.action = 'RectangleSelect';
    },

    dynamicLoading: true,
    onScroll: async args => {
      args.async = true;

      // simulating a server-side call
      setTimeout(() => {
        const scheduler = getScheduler();
        const fetchedEvents = getEventData(args.viewport.start, args.viewport.end);

        const mapped = scheduler.events.all().map(event => event.id()).reduce((acc, id) => {
          acc[id] = id;
          return acc;
        }, {})


        const newEvents = fetchedEvents.filter(event => !mapped[event.id]);

        args.events = scheduler.events.all().map(event => event.data).concat(newEvents);
        args.loaded();
      }, 1000);
    },
  });


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
          {name: "Tesla X", seats: 5, doors: 4, transmission: "Automatic", id: "H"},
          {name: "Mercedes GLA", seats: 5, doors: 4, transmission: "Automatic", id: "I"},
          {name: "Audi Q7", seats: 5, doors: 4, transmission: "Automatic", id: "J"},
        ]
      },
    ];

    const events = [];

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
