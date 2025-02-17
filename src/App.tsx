import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, isSameDay } from "date-fns";
import AnimatedLoadingScreen from "./AnimatedLoadingScreen";
import AnimatedLogo from "./AnimatedLogo";
import {
  AppState,
  Task,
  Category,
  MainViewProps,
  SettingsViewProps,
  TaskFormProps,
} from "./types";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoading: true,
    view: "main",
    tasks: [],
    categories: ["仕事", "家事", "その他"],
  });

  useEffect(() => {
    const loadTasks = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setState((prevState) => ({
        ...prevState,
        tasks: [],
        isLoading: false,
      }));
    };

    loadTasks();
  }, []);

  const handleLoadComplete = () => {
    setState((prevState) => ({ ...prevState, isLoading: false }));
  };

  return (
    <div className="app min-h-screen bg-gray-100">
      {state.isLoading && (
        <AnimatedLoadingScreen onLoadComplete={handleLoadComplete} />
      )}
      {!state.isLoading && (
        <div className="p-4 w-3/4 mx-auto flex flex-col">
          <header className="h-[12vh] p-4 flex justify-between items-center">
            <div className="flex flex-row items-center">
              <AnimatedLogo />
              <h1 className="-ml-5 text-4xl">Routhme.io</h1>
            </div>
            <button
              onClick={() =>
                setState((prevState) => ({
                  ...prevState,
                  view: prevState.view === "main" ? "settings" : "main",
                }))
              }
              className="p-2"
            >
              {state.view === "main" ? <Settings /> : <ChevronLeft />}
            </button>
          </header>
          <div className="w-3/4 mx-auto">
            {state.view === "main" ? (
              <MainView tasks={state.tasks} />
            ) : (
              <SettingsView
                tasks={state.tasks}
                setTasks={(newTasks) =>
                    setState((prevState) => ({
                      ...prevState,
                      tasks: typeof newTasks === 'function' ? newTasks(prevState.tasks) : newTasks
                    }))
                  }
                categories={state.categories}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MainView: React.FC<MainViewProps> = ({ tasks }) => {
  const today = new Date();
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];

  const isTodaysTask = (task: Task, today: Date): boolean => {
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);

    switch (task.recurrence.type) {
      case "once":
        return isSameDay(task.startDate, today);

      case "daily":
        return true;

      case "weekly":
        return (
          task.recurrence.days!.includes(dayOfWeek) &&
          ((today.getTime() - task.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) %
            task.recurrence.interval ===
            0
        );

      case "monthly":
        if (task.recurrence.days) {
          return (
            task.recurrence.days.includes(dayOfWeek) &&
            task.recurrence.weeks!.includes(weekOfMonth) &&
            (today.getMonth() -
              task.startDate.getMonth() +
              (today.getFullYear() - task.startDate.getFullYear()) * 12) %
              task.recurrence.interval ===
              0
          );
        } else {
          return (
            dayOfMonth === task.startDate.getDate() &&
            (today.getMonth() -
              task.startDate.getMonth() +
              (today.getFullYear() - task.startDate.getFullYear()) * 12) %
              task.recurrence.interval ===
              0
          );
        }

      case "yearly":
        return (
          today.getMonth() === task.startDate.getMonth() &&
          dayOfMonth === task.startDate.getDate() &&
          (today.getFullYear() - task.startDate.getFullYear()) %
            task.recurrence.interval ===
            0
        );

      case "custom":
        const diffDays = Math.floor(
          (today.getTime() - task.startDate.getTime()) / (24 * 60 * 60 * 1000)
        );
        switch (task.recurrence.intervalUnit) {
          case "day":
            return diffDays % task.recurrence.interval === 0;
          case "week":
            return (
              diffDays % (7 * task.recurrence.interval) === 0 &&
              task.recurrence.days!.includes(dayOfWeek)
            );
          case "month":
            return (
              today.getDate() === task.startDate.getDate() &&
              (today.getMonth() -
                task.startDate.getMonth() +
                (today.getFullYear() - task.startDate.getFullYear()) * 12) %
                task.recurrence.interval ===
                0
            );
          case "year":
            return (
              today.getMonth() === task.startDate.getMonth() &&
              today.getDate() === task.startDate.getDate() &&
              (today.getFullYear() - task.startDate.getFullYear()) %
                task.recurrence.interval ===
                0
            );
        }
    }

    return false;
  };

  const isTaskActive = (task: Task, today: Date): boolean => {
    if (task.endCondition.type === "onDate") {
      return today <= task.endCondition.date!;
    } else if (task.endCondition.type === "afterOccurrences") {
      return true;
    }
    return true;
  };

  const todaysTasks = tasks.filter(
    (task) => isTodaysTask(task, today) && isTaskActive(task, today)
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        本日のタスク ({dayOfWeek}曜日)
      </h2>
      {todaysTasks.length === 0 ? (
        <p className="text-gray-500">本日のタスクはありません。</p>
      ) : (
        <ul className="space-y-2">
          {todaysTasks.map((task) => (
            <li
              key={task.id}
              className="bg-white p-4 rounded shadow flex items-center"
            >
              <input type="checkbox" className="mr-4" />
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">
                  {task.category} - {task.startTime} - {task.endTime}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SettingsView: React.FC<SettingsViewProps> = ({
  tasks,
  setTasks,
  categories,
}) => {
  const [filterType, setFilterType] = useState<Task["recurrence"]["type"] | "all">("all");
  const [selectedDay, setSelectedDay] = useState<number>(-1);
  const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];

  const filteredTasks = tasks
    .filter((task) => {
      if (filterType === "all") return true;
      return task.recurrence.type === filterType;
    })
    .filter((task) => {
      if (selectedDay === -1) return true;
      const dayIndex = selectedDay;

      switch (task.recurrence.type) {
        case "daily":
          return true;
        case "weekly":
          return task.recurrence.days!.includes(dayIndex);
        case "custom":
          return task.recurrence.days!.includes(dayIndex);
        case "monthly":
          if (task.recurrence.days) {
            return task.recurrence.days.includes(dayIndex);
          }
          return (
            new Date(
              task.startDate.getFullYear(),
              task.startDate.getMonth(),
              task.startDate.getDate()
            ).getDay() === dayIndex
          );
        case "yearly":
          return (
            new Date(
              task.startDate.getFullYear(),
              task.startDate.getMonth(),
              task.startDate.getDate()
            ).getDay() === dayIndex
          );
        default:
          return false;
      }
    });

  const addOrUpdateTask = (newTask: Task) => {
    if (editingTask) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id ? { ...newTask, id: editingTask.id } : task
        )
      );
    } else {
      const taskWithId = { ...newTask, id: Date.now() };

      if (typeof taskWithId.startDate === "string") {
        taskWithId.startDate = new Date(taskWithId.startDate);
      }

      if (
        taskWithId.endCondition &&
        taskWithId.endCondition.type === "onDate" &&
        typeof taskWithId.endCondition.date === "string"
      ) {
        taskWithId.endCondition.date = new Date(taskWithId.endCondition.date);
      }

      setTasks([...tasks, taskWithId]);
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">タスク設定</h2>
      <div className="mb-4">
        <label className="block mb-2">頻度でフィルター:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as Task["recurrence"]["type"] | "all")}
          className="w-full p-2 border rounded"
        >
          <option value="all">すべて</option>
          <option value="once">1回のみ</option>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
          <option value="yearly">毎年</option>
          <option value="custom">カスタム</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">曜日でフィルター:</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(parseInt(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value={-1}>すべての曜日</option>
          {daysOfWeek.map((day, index) => (
            <option key={day} value={index}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <ul className="space-y-2 mb-4">
        {filteredTasks.map((task) => (
          <li key={task.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-600">
              {task.category} - {task.recurrence.type}
              {task.recurrence.type === "weekly" ||
              (task.recurrence.type === "custom" &&
                task.recurrence.intervalUnit === "week")
                ? ` - ${task.recurrence.days!
                    .map((day) => daysOfWeek[day])
                    .join(", ")}`
                : ""}
              {task.recurrence.type === "monthly" && task.recurrence.days
                ? ` - 第${task.recurrence.weeks!
                    .map((w) => w + 1)
                    .join(",")}週 ${task.recurrence.days
                    .map((day) => daysOfWeek[day])
                    .join(", ")}`
                : ""}
              {task.recurrence.type === "custom"
                ? ` - ${task.recurrence.interval}${task.recurrence.intervalUnit}ごと`
                : ""}
            </p>
            <p className="text-sm text-gray-600">
              {task.startTime} - {task.endTime}
            </p>
            <button
              onClick={() => {
                setEditingTask(task);
                setShowTaskForm(true);
              }}
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
            >
              編集
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          setEditingTask(null);
          setShowTaskForm(true);
        }}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        新しいタスクを追加
      </button>
      {showTaskForm && (
        <TaskForm
          addOrUpdateTask={addOrUpdateTask}
          categories={categories}
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
        />
      )}
    </div>
  );
};

const TaskForm: React.FC<TaskFormProps> = ({
  addOrUpdateTask,
  categories,
  onClose,
  editingTask,
}) => {
  const [title, setTitle] = useState(editingTask ? editingTask.title : "");
  const [category, setCategory] = useState<Category>(
    editingTask ? editingTask.category : categories[0]
  );
  const [startDate, setStartDate] = useState<Date>(
    editingTask ? new Date(editingTask.startDate) : new Date()
  );
  const [startTime, setStartTime] = useState(
    editingTask ? editingTask.startTime : ""
  );
  const [endTime, setEndTime] = useState(
    editingTask ? editingTask.endTime : ""
);
const [recurrenceType, setRecurrenceType] = useState<Task["recurrence"]["type"]>(
  editingTask ? editingTask.recurrence.type : "once"
);
const [intervalValue, setIntervalValue] = useState(
  editingTask ? editingTask.recurrence.interval : 1
);
const [intervalUnit, setIntervalUnit] = useState<"day" | "week" | "month" | "year">(
  editingTask ? editingTask.recurrence.intervalUnit || "day" : "day"
);
const [weeklyDays, setWeeklyDays] = useState<number[]>(
  editingTask ? editingTask.recurrence.days || [] : []
);
const [monthlyType, setMonthlyType] = useState<"dayOfMonth" | "dayOfWeek">(
  editingTask && editingTask.recurrence.weeks ? "dayOfWeek" : "dayOfMonth"
);
const [monthlyDate, setMonthlyDate] = useState(
  editingTask ? editingTask.startDate.getDate() : 1
);
const [monthlyWeeks, setMonthlyWeeks] = useState<number[]>(
  editingTask ? editingTask.recurrence.weeks || [] : []
);
const [monthlyWeekDays, setMonthlyWeekDays] = useState<number[]>(
  editingTask ? editingTask.recurrence.days || [] : []
);
const [yearlyMonth, setYearlyMonth] = useState(
  editingTask ? editingTask.startDate.getMonth() : 0
);
const [yearlyDate, setYearlyDate] = useState(
  editingTask ? editingTask.startDate.getDate() : 1
);
const [endOption, setEndOption] = useState<Task["endCondition"]["type"]>(
  editingTask ? editingTask.endCondition.type : "never"
);
const [endDate, setEndDate] = useState<Date | null>(
  editingTask && editingTask.endCondition.date
    ? new Date(editingTask.endCondition.date)
    : null
);
const [occurrences, setOccurrences] = useState(
  editingTask ? editingTask.endCondition.occurrences || 1 : 1
);

const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
const weeksOfMonth = ["第1", "第2", "第3", "第4", "最終"];
const monthsOfYear = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月"
];

const handleWeeklyDayToggle = (index: number) => {
  setWeeklyDays(
    weeklyDays.includes(index)
      ? weeklyDays.filter((d) => d !== index)
      : [...weeklyDays, index]
  );
};

const handleMonthlyWeekToggle = (index: number) => {
  setMonthlyWeeks(
    monthlyWeeks.includes(index)
      ? monthlyWeeks.filter((w) => w !== index)
      : [...monthlyWeeks, index]
  );
};

const handleMonthlyWeekDayToggle = (index: number) => {
  setMonthlyWeekDays(
    monthlyWeekDays.includes(index)
      ? monthlyWeekDays.filter((d) => d !== index)
      : [...monthlyWeekDays, index]
  );
};

const renderRecurrenceOptions = () => {
  switch (recurrenceType) {
    case "once":
      return null;
    case "daily":
      return <p>毎日繰り返し</p>;
    case "weekly":
      return (
        <div>
          <p>毎週繰り返し：</p>
          {daysOfWeek.map((day, index) => (
            <label key={day} className="mr-2">
              <input
                type="checkbox"
                checked={weeklyDays.includes(index)}
                onChange={() => handleWeeklyDayToggle(index)}
              />{" "}
              {day}
            </label>
          ))}
        </div>
      );
    case "monthly":
      return (
        <div>
          <select
            value={monthlyType}
            onChange={(e) => setMonthlyType(e.target.value as "dayOfMonth" | "dayOfWeek")}
            className="mb-2"
          >
            <option value="dayOfMonth">毎月同じ日</option>
            <option value="dayOfWeek">毎月特定の週・曜日</option>
          </select>
          {monthlyType === "dayOfMonth" ? (
            <div>
              毎月
              <input
                type="number"
                min="1"
                max="31"
                value={monthlyDate}
                onChange={(e) => setMonthlyDate(parseInt(e.target.value))}
                className="w-16 mx-2"
              />
              日
            </div>
          ) : (
            <div>
              <p>毎月：</p>
              <div className="mb-2">
                {weeksOfMonth.map((week, index) => (
                  <label key={week} className="mr-2">
                    <input
                      type="checkbox"
                      checked={monthlyWeeks.includes(index)}
                      onChange={() => handleMonthlyWeekToggle(index)}
                    />{" "}
                    {week}
                  </label>
                ))}
              </div>
              <div>
                {daysOfWeek.map((day, index) => (
                  <label key={day} className="mr-2">
                    <input
                      type="checkbox"
                      checked={monthlyWeekDays.includes(index)}
                      onChange={() => handleMonthlyWeekDayToggle(index)}
                    />{" "}
                    {day}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    case "yearly":
      return (
        <div>
          毎年
          <select
            value={yearlyMonth}
            onChange={(e) => setYearlyMonth(parseInt(e.target.value))}
            className="mx-2"
          >
            {monthsOfYear.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="31"
            value={yearlyDate}
            onChange={(e) => setYearlyDate(parseInt(e.target.value))}
            className="w-16 mx-2"
          />
          日
        </div>
      );
    case "custom":
      return (
        <div>
          <div className="mb-2">
            <input
              type="number"
              min="1"
              value={intervalValue}
              onChange={(e) => setIntervalValue(parseInt(e.target.value))}
              className="w-16 mr-2"
            />
            <select
              value={intervalUnit}
              onChange={(e) => setIntervalUnit(e.target.value as "day" | "week" | "month" | "year")}
            >
              <option value="day">日</option>
              <option value="week">週</option>
              <option value="month">月</option>
              <option value="year">年</option>
            </select>
            ごとに繰り返し
          </div>
          {intervalUnit === "week" && (
            <div>
              <p>繰り返す曜日：</p>
              {daysOfWeek.map((day, index) => (
                <label key={day} className="mr-2">
                  <input
                    type="checkbox"
                    checked={weeklyDays.includes(index)}
                    onChange={() => handleWeeklyDayToggle(index)}
                  />{" "}
                  {day}
                </label>
              ))}
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
};

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const taskData: Task = {
    id: editingTask ? editingTask.id : Date.now(),
    title,
    category,
    startDate,
    startTime,
    endTime,
    recurrence: {
      type: recurrenceType,
      interval: intervalValue,
      intervalUnit,
      days: weeklyDays,
      weeks: monthlyWeeks,
    },
    endCondition: {
      type: endOption,
      date: endDate,
      occurrences,
    },
  };
  addOrUpdateTask(taskData);
  onClose();
};

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg max-w-2xl w-full space-y-4 my-8"
    >
      <h2 className="text-xl font-semibold mb-4">
        {editingTask ? "タスクを編集" : "新しいタスク"}
      </h2>

      <div>
        <label htmlFor="title" className="block mb-1">
          タイトル:
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block mb-1">
          カテゴリ:
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="startDate" className="block mb-1">
          開始日:
        </label>
        <DatePicker
  selected={startDate}
  onChange={(date: Date | null) => setStartDate(date || new Date())}
  dateFormat="yyyy/MM/dd"
  className="w-full p-2 border rounded"
  required
/>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="startTime" className="block mb-1">
            開始時間:
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="flex-1">
          <label htmlFor="endTime" className="block mb-1">
            終了時間:
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="recurrenceType" className="block mb-1">
          繰り返し:
        </label>
        <select
          id="recurrenceType"
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value as Task["recurrence"]["type"])}
          className="w-full p-2 border rounded"
        >
          <option value="once">1回のみ</option>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
          <option value="yearly">毎年</option>
          <option value="custom">カスタム</option>
        </select>
      </div>

      {renderRecurrenceOptions()}

      <div>
        <label className="block mb-1">終了設定:</label>
        <div>
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              value="never"
              checked={endOption === "never"}
              onChange={() => setEndOption("never")}
              className="mr-2"
            />
            終了日なし
          </label>
          <label className="inline-flex items-center mr-4">
            <input
              type="radio"
              value="onDate"
              checked={endOption === "onDate"}
              onChange={() => setEndOption("onDate")}
              className="mr-2"
            />
            指定日に終了
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="afterOccurrences"
              checked={endOption === "afterOccurrences"}
              onChange={() => setEndOption("afterOccurrences")}
              className="mr-2"
            />
            指定回数後に終了
          </label>
        </div>
      </div>

      {endOption === "onDate" && (
        <div>
          <label htmlFor="endDate" className="block mb-1">
            終了日:
          </label>
          <DatePicker
  selected={endDate}
  onChange={(date: Date | null) => setEndDate(date)}
  dateFormat="yyyy/MM/dd"
  className="w-full p-2 border rounded"
  required
/>
        </div>
      )}

      {endOption === "afterOccurrences" && (
        <div>
          <label htmlFor="occurrences" className="block mb-1">
            繰り返し回数:
          </label>
          <input
            type="number"
            id="occurrences"
            value={occurrences}
            onChange={(e) => setOccurrences(parseInt(e.target.value))}
            min="1"
            className="w-full p-2 border rounded"
            required
          />
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingTask ? "更新" : "保存"}
        </button>
      </div>
    </form>
  </div>
);
};

export default App;