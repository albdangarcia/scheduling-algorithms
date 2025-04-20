import {
  CalculationType,
} from "../definitions";

const fetchCalculations = async () => {
  const calculations: CalculationType[] = [
    {
      id: 1,
      dropDownIndexOption: "fcfs",
      title: "fcfs",
      values: {
        arrivalTimeValues: "1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10",
        burstTimeValues: "1, 2,",
      },
      selectedRadioButtonOption: "nonpreemptive",
    },
    {
      id: 2,
      dropDownIndexOption: "rr",
      title: "rr",
      values: {
        arrivalTimeValues: "2 10",
        burstTimeValues: "1 2",
        timeSlice: "2",
      },
      selectedRadioButtonOption: "preemptive",
    },
    {
      id: 3,
      dropDownIndexOption: "rr",
      title: "rr",
      values: {
        arrivalTimeValues: "2 1",
        burstTimeValues: "1 2",
        timeSlice: "3",
      },
      selectedRadioButtonOption: "preemptive",
    },
  ];
  return calculations;
};

export { fetchCalculations };