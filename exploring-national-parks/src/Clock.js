import React, { useState, useEffect } from 'react'; //import necessary hooks from react

//clock functional component definition
const Clock = () => {
  const [time, setTime] = useState(new Date());//keeps track of current time

  //effect hook to set up timer
  useEffect(() => {
    const timerId = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  function tick() {
    setTime(new Date());
  }

  return (
    <div className="clock">
      <h1>{time.toLocaleTimeString()}</h1>
    </div>
  );
}

export default Clock;