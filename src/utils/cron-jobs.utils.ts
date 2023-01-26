import schedule from "node-schedule";

/**
 *    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
 */

// https://crontab.guru/

export function runEverySpecifiedSecond(
  second: number,
  callbackExecution: Function,
  cancelAfterInitialRun: boolean = false
) {
  const job = schedule.scheduleJob(`*/${second} * * * * *`, function () {
    console.log(`Cron job that runs every ${second} seconds.`);
    callbackExecution();
    cancelAfterInitialRun && job.cancel();
  });
}

export function runAtBeginningOfEveryMonth(
  callbackExecution: Function,
  cancelAfterInitialRun: boolean = false
) {
  const job = schedule.scheduleJob("0 0 1 * *", function () {
    console.log(
      `Cron job "runAtBeginningOfEveryMonth() was run at ${new Date()}`
    );
    callbackExecution();
    cancelAfterInitialRun && job.cancel();
  });
}
