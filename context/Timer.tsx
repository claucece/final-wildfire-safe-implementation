import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";

interface TimerContextProps {
  duration: number;
  setDuration: Dispatch<SetStateAction<number>>;
}

export const TimerContext = createContext<TimerContextProps>({
  duration: 20,
  setDuration: () => {},
});

interface TimerProps {
  children: ReactNode;
}

const Timer = ({ children }: TimerProps) => {
  const [duration, setDuration] = useState<number>(20);

  return (
    <TimerContext.Provider value={{ duration, setDuration }}>
      {children}
    </TimerContext.Provider>
  );
};

export default Timer;
