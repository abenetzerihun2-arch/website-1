type ConsoleTask = {
  run<T>(callback: () => T): T;
};

type ConsoleWithCreateTask = Console & {
  createTask?: (name: string) => ConsoleTask;
};

function fallbackCreateTask(): ConsoleTask {
  return {
    run(callback) {
      return callback();
    },
  };
}

const workerConsole = console as ConsoleWithCreateTask;
let shouldInstallFallback = typeof workerConsole.createTask !== "function";

if (!shouldInstallFallback) {
  try {
    const task = workerConsole.createTask?.("vinext");
    shouldInstallFallback = !task || typeof task.run !== "function";
  } catch {
    shouldInstallFallback = true;
  }
}

if (shouldInstallFallback) {
  Object.defineProperty(workerConsole, "createTask", {
    configurable: true,
    value: fallbackCreateTask,
  });
}
