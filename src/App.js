import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse } from 'date-fns';
import AnimatedLogo from './AnimatedLogo';

const App = () => {
  const [view, setView] = useState('main'); // 'main' or 'settings'
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState(['仕事', '家事', 'その他']);

  useEffect(() => {
    // ここでタスクをロードする（実際のアプリではローカルストレージやバックエンドから）
    setTasks([
      {
        id: 1,
        title: 'レポート作成',
        category: '仕事',
        startDate: new Date('2024-07-08'),
        startTime: '10:00',
        endTime: '12:00',
        recurrence: {
          type: 'weekly',
          interval: 1,
          days: [1], // 0: 日曜日, 1: 月曜日, ..., 6: 土曜日
        },
        endCondition: {
          type: 'never',
          date: null,
          occurrences: null,
        },
      },
      {
        id: 2,
        title: '掃除',
        category: '家事',
        startDate: new Date('2024-07-06'),
        startTime: '09:00',
        endTime: '10:00',
        recurrence: {
          type: 'monthly',
          interval: 1,
          weeks: [0, 2], // 0: 第1週, 1: 第2週, 2: 第3週, 3: 第4週, 4: 最終週
          days: [6], // 土曜日
        },
        endCondition: {
          type: 'never',
          date: null,
          occurrences: null,
        },
      },
      {
        id: 3,
        title: 'ジョギング',
        category: '健康',
        startDate: new Date('2024-07-05'),
        startTime: '06:00',
        endTime: '07:00',
        recurrence: {
          type: 'custom',
          interval: 2,
          intervalUnit: 'day',
          days: [], // カスタムで日を指定する場合は空配列
        },
        endCondition: {
          type: 'onDate',
          date: new Date('2024-12-31'),
          occurrences: null,
        },
      },
      {
        id: 4,
        title: 'チームミーティング',
        category: '仕事',
        startDate: new Date('2024-07-09'),
        startTime: '14:00',
        endTime: '15:00',
        recurrence: {
          type: 'custom',
          interval: 2,
          intervalUnit: 'week',
          days: [1, 3], // 月曜日と水曜日
        },
        endCondition: {
          type: 'afterOccurrences',
          date: null,
          occurrences: 10,
        },
      },
    ]);
  }, []);

  return (
    <div className="app p-4 max-w-3xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">ルーティンワークTo-doリスト</h1>
        <button onClick={() => setView(view === 'main' ? 'settings' : 'main')} className="p-2">
          {view === 'main' ? <Settings /> : <ChevronLeft />}
        </button>
      </header>
      {/* {view === 'main' ? (
        <MainView tasks={tasks} />
      ) : (
        <SettingsView tasks={tasks} setTasks={setTasks} categories={categories} />
      )} */}
      <AnimatedLogo />
    </div>
  );
};

const MainView = ({ tasks }) => {
  const today = new Date();
  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][today.getDay()];
  const isTodaysTask = (task, today) => {
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();
    const weekOfMonth = Math.floor((dayOfMonth - 1) / 7);
  
    switch (task.recurrence.type) {
      case 'once':
        return task.startDate.toDateString() === today.toDateString();
      
      case 'daily':
        return true;
      
      case 'weekly':
        return task.recurrence.days.includes(dayOfWeek) &&
               (today - task.startDate) / (7 * 24 * 60 * 60 * 1000) % task.recurrence.interval === 0;
      
      case 'monthly':
        if (task.recurrence.days) {
          // 毎月第N週の特定の曜日
          return task.recurrence.days.includes(dayOfWeek) &&
                 task.recurrence.weeks.includes(weekOfMonth) &&
                 (today.getMonth() - task.startDate.getMonth() + 
                 (today.getFullYear() - task.startDate.getFullYear()) * 12) % task.recurrence.interval === 0;
        } else {
          // 毎月同じ日
          return dayOfMonth === task.startDate.getDate() &&
                 (today.getMonth() - task.startDate.getMonth() + 
                 (today.getFullYear() - task.startDate.getFullYear()) * 12) % task.recurrence.interval === 0;
        }
      
      case 'yearly':
        return today.getMonth() === task.startDate.getMonth() &&
               dayOfMonth === task.startDate.getDate() &&
               (today.getFullYear() - task.startDate.getFullYear()) % task.recurrence.interval === 0;
      
      case 'custom':
        const diffDays = Math.floor((today - task.startDate) / (24 * 60 * 60 * 1000));
        switch (task.recurrence.intervalUnit) {
          case 'day':
            return diffDays % task.recurrence.interval === 0;
          case 'week':
            return diffDays % (7 * task.recurrence.interval) === 0 &&
                   task.recurrence.days.includes(dayOfWeek);
          case 'month':
            return today.getDate() === task.startDate.getDate() &&
                   (today.getMonth() - task.startDate.getMonth() + 
                   (today.getFullYear() - task.startDate.getFullYear()) * 12) % task.recurrence.interval === 0;
          case 'year':
            return today.getMonth() === task.startDate.getMonth() &&
                   today.getDate() === task.startDate.getDate() &&
                   (today.getFullYear() - task.startDate.getFullYear()) % task.recurrence.interval === 0;
        }
        break;
    }
  
    return false;
  };
  
  const isTaskActive = (task, today) => {
    if (task.endCondition.type === 'onDate') {
      return today <= task.endCondition.date;
    } else if (task.endCondition.type === 'afterOccurrences') {
      // この部分の実装は、発生回数を追跡するロジックが必要です
      // ここでは簡略化のため、常にtrueを返します
      return true;
    }
    return true; // 'never' の場合や、その他の場合
  };
  
  const todaysTasks = tasks.filter(task => {
    const today = new Date(); // 現在の日付
    return isTodaysTask(task, today) && isTaskActive(task, today);
  });

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">本日のタスク ({dayOfWeek}曜日)</h2>
      {todaysTasks.length === 0 ? (
        <p className="text-gray-500">本日のタスクはありません。</p>
      ) : (
        <ul className="space-y-2">
          {todaysTasks.map(task => (
            <li key={task.id} className="bg-white p-4 rounded shadow flex items-center">
              <input type="checkbox" className="mr-4" />
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.category} - {task.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


const SettingsView = ({ tasks, setTasks, categories }) => {
  const [filterType, setFilterType] = useState('all');
  const [selectedDay, setSelectedDay] = useState(-1);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  
  const filteredTasks = tasks.filter(task => {
    if (filterType === 'all') return true;
    return task.recurrence.type === filterType;
  }).filter(task => {
    if (selectedDay === -1) return true;
    const dayIndex = selectedDay
    
    switch (task.recurrence.type) {
      case 'daily':
        return true;
      case 'weekly':
        return task.recurrence.days.includes(dayIndex);
      case 'custom':
        return task.recurrence.days.includes(dayIndex);
      case 'monthly':
        if (task.recurrence.days) {
          return task.recurrence.days.includes(dayIndex);
        }
        // 毎月同じ日の場合は、選択された曜日が一致するかチェック
        return new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate()).getDay() === dayIndex;
      case 'yearly':
        // 年次タスクの場合も、選択された曜日が一致するかチェック
        return new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate()).getDay() === dayIndex;
      default:
        return false;
    }
  });
  
  const addOrUpdateTask = (newTask) => {
    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? { ...newTask, id: editingTask.id } : task));
    } else {
      // 新しいタスクにIDを追加
      const taskWithId = { ...newTask, id: Date.now() };
      
      // startDateが文字列の場合、Dateオブジェクトに変換
      if (typeof taskWithId.startDate === 'string') {
        taskWithId.startDate = new Date(taskWithId.startDate);
      }
      
      // endCondition.dateが文字列の場合、Dateオブジェクトに変換
      if (taskWithId.endCondition && taskWithId.endCondition.type === 'onDate' && typeof taskWithId.endCondition.date === 'string') {
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
        onChange={(e) => setFilterType(e.target.value)}
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
          <option key={day} value={index}>{day}</option>
        ))}
      </select>
    </div>
    <ul className="space-y-2 mb-4">
      {filteredTasks.map(task => (
        <li key={task.id} className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-600">
            {task.category} - {task.recurrence.type}
            {task.recurrence.type === 'weekly' || (task.recurrence.type === 'custom' && task.recurrence.intervalUnit === 'week') ? 
              ` - ${task.recurrence.days.map(day => daysOfWeek[day]).join(', ')}` : ''}
            {task.recurrence.type === 'monthly' && task.recurrence.days ? 
              ` - 第${task.recurrence.weeks.map(w => w + 1).join(',')}週 ${task.recurrence.days.map(day => daysOfWeek[day]).join(', ')}` : ''}
            {task.recurrence.type === 'custom' ? ` - ${task.recurrence.interval}${task.recurrence.intervalUnit}ごと` : ''}
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

const TaskForm = ({ addOrUpdateTask, categories, selectedDate = new Date(), onClose, editingTask }) => {
  const [title, setTitle] = useState(editingTask ? editingTask.title : '');
  const [category, setCategory] = useState(editingTask ? editingTask.category : categories[0]);
  const [startDate, setStartDate] = useState(editingTask ? new Date(editingTask.startDate) : selectedDate);
  const [startTime, setStartTime] = useState(editingTask ? editingTask.startTime : '');
  const [endTime, setEndTime] = useState(editingTask ? editingTask.endTime : '');
  const [recurrenceType, setRecurrenceType] = useState(editingTask ? editingTask.recurrenceType : 'once');
  const [customRecurrenceType, setCustomRecurrenceType] = useState(editingTask ? editingTask.customRecurrenceType : 'interval');
  const [intervalValue, setIntervalValue] = useState(editingTask ? editingTask.intervalValue : 1);
  const [intervalUnit, setIntervalUnit] = useState(editingTask ? editingTask.intervalUnit : 'day');
  const [weeklyDays, setWeeklyDays] = useState(editingTask ? editingTask.weeklyDays : []);
  const [monthlyType, setMonthlyType] = useState(editingTask ? editingTask.monthlyType : 'dayOfMonth');
  const [monthlyDate, setMonthlyDate] = useState(editingTask ? editingTask.monthlyDate : 1);
  const [monthlyWeeks, setMonthlyWeeks] = useState(editingTask ? editingTask.monthlyWeeks : []);
  const [monthlyWeekDays, setMonthlyWeekDays] = useState(editingTask ? editingTask.monthlyWeekDays : []);
  const [yearlyMonth, setYearlyMonth] = useState(editingTask ? editingTask.yearlyMonth : 0);
  const [yearlyDate, setYearlyDate] = useState(editingTask ? editingTask.yearlyDate : 1);
  const [endOption, setEndOption] = useState(editingTask ? editingTask.endOption : 'never');
  const [endDate, setEndDate] = useState(editingTask ? (editingTask.endDate ? new Date(editingTask.endDate) : null) : null);
  const [occurrences, setOccurrences] = useState(editingTask ? editingTask.occurrences : 1);
  const [customIntervalUnit, setCustomIntervalUnit] = useState(editingTask?.customIntervalUnit || 'day');
  const [customIntervalValue, setCustomIntervalValue] = useState(editingTask?.customIntervalValue || 1);
  const [customWeekDays, setCustomWeekDays] = useState(editingTask?.customWeekDays || []);
  const [customTimes, setCustomTimes] = useState(editingTask?.customTimes || [{ startTime: '', endTime: '' }]);

  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  const weeksOfMonth = ['第1', '第2', '第3', '第4', '最終'];
  const monthsOfYear = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const handleWeeklyDayToggle = (index) => {
    setWeeklyDays(weeklyDays.includes(index)
      ? weeklyDays.filter(d => d !== index)
      : [...weeklyDays, index]
    );
  };

  const handleMonthlyWeekToggle = (index) => {
    setMonthlyWeeks(monthlyWeeks.includes(index)
      ? monthlyWeeks.filter(w => w !== index)
      : [...monthlyWeeks, index]
    );
  };

  const handleMonthlyWeekDayToggle = (index) => {
    setMonthlyWeekDays(monthlyWeekDays.includes(index)
      ? monthlyWeekDays.filter(d => d !== index)
      : [...monthlyWeekDays, index]
    );
  };

  const handleCustomWeekDayToggle = (index) => {
    setCustomWeekDays(customWeekDays.includes(index)
      ? customWeekDays.filter(d => d !== index)
      : [...customWeekDays, index]
    );
  };

  const handleAddCustomTime = () => {
    setCustomTimes([...customTimes, { startTime: '', endTime: '' }]);
  };

  const handleRemoveCustomTime = (index) => {
    setCustomTimes(customTimes.filter((_, i) => i !== index));
  };

  const handleCustomTimeChange = (index, field, value) => {
    const newTimes = [...customTimes];
    newTimes[index][field] = value;
    setCustomTimes(newTimes);
  };

  const renderCustomRecurrenceOptions = () => {
    return (
      <div>
        <div className="mb-4">
          <label className="block mb-2">繰り返し間隔:</label>
          <div className="flex items-center">
            <input
              type="number"
              value={customIntervalValue}
              onChange={(e) => setCustomIntervalValue(parseInt(e.target.value))}
              min="1"
              className="w-16 p-2 border rounded mr-2"
            />
            <select
              value={customIntervalUnit}
              onChange={(e) => setCustomIntervalUnit(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="day">日</option>
              <option value="week">週</option>
              <option value="month">月</option>
              <option value="year">年</option>
            </select>
            <span className="ml-2">ごと</span>
          </div>
        </div>
  
        {customIntervalUnit === 'week' && (
          <div className="mb-4">
            <label className="block mb-2">繰り返す曜日:</label>
            {daysOfWeek.map((day, index) => (
              <label key={day} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  checked={customWeekDays.includes(index)}
                  onChange={() => handleCustomWeekDayToggle(index)}
                  className="mr-1"
                />
                {day}
              </label>
            ))}
          </div>
        )}
  
        <div className="mb-4">
          <label className="block mb-2">時間帯:</label>
          {customTimes.map((time, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="time"
                value={time.startTime}
                onChange={(e) => handleCustomTimeChange(index, 'startTime', e.target.value)}
                className="p-2 border rounded mr-2"
              />
              <span className="mx-2">-</span>
              <input
                type="time"
                value={time.endTime}
                onChange={(e) => handleCustomTimeChange(index, 'endTime', e.target.value)}
                className="p-2 border rounded mr-2"
              />
              <button
                type="button"
                onClick={() => handleRemoveCustomTime(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                削除
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddCustomTime}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            時間帯を追加
          </button>
        </div>
      </div>
    );
  };

  const renderRecurrenceOptions = () => {
    switch (recurrenceType) {
      case 'once':
        return null;
      case 'daily':
        return <p>毎日繰り返し</p>;
      case 'weekly':
        return (
          <div>
            <p>毎週繰り返し：</p>
            {daysOfWeek.map((day, index) => (
              <label key={day} className="mr-2">
                <input
                  type="checkbox"
                  checked={weeklyDays.includes(index)}
                  onChange={() => handleWeeklyDayToggle(index)}
                /> {day}
              </label>
            ))}
          </div>
        );
      case 'monthly':
        return (
          <div>
            <select
              value={monthlyType}
              onChange={(e) => setMonthlyType(e.target.value)}
              className="mb-2"
            >
              <option value="dayOfMonth">毎月同じ日</option>
              <option value="dayOfWeek">毎月特定の週・曜日</option>
            </select>
            {monthlyType === 'dayOfMonth' ? (
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
                      /> {week}
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
                      /> {day}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'yearly':
        return (
          <div>
            毎年
            <select
              value={yearlyMonth}
              onChange={(e) => setYearlyMonth(parseInt(e.target.value))}
              className="mx-2"
            >
              {monthsOfYear.map((month, index) => (
                <option key={month} value={index}>{month}</option>
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
      case 'custom':
        return renderCustomRecurrenceOptions();
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      title,
      category,
      startDate,
      startTime,
      endTime,
      recurrenceType,
      customRecurrenceType,
      intervalValue,
      intervalUnit,
      weeklyDays,
      monthlyType,
      monthlyDate,
      monthlyWeeks,
      monthlyWeekDays,
      yearlyMonth,
      yearlyDate,
      endOption,
      endDate,
      occurrences,
      customIntervalUnit,
      customIntervalValue,
      customWeekDays,
      customTimes,
    };
    addOrUpdateTask(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg max-w-2xl w-full space-y-4 my-8">
        <h2 className="text-xl font-semibold mb-4">{editingTask ? 'タスクを編集' : '新しいタスク'}</h2>
        
        <div>
          <label htmlFor="title" className="block mb-1">タイトル:</label>
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
          <label htmlFor="category" className="block mb-1">カテゴリ:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block mb-1">開始日:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy/MM/dd"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="startTime" className="block mb-1">開始時間:</label>
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
            <label htmlFor="endTime" className="block mb-1">終了時間:</label>
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
          <label htmlFor="recurrenceType" className="block mb-1">繰り返し:</label>
          <select
            id="recurrenceType"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
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
                checked={endOption === 'never'}
                onChange={() => setEndOption('never')}
                className="mr-2"
              />
              終了日なし
            </label>
            <label className="inline-flex items-center mr-4">
              <input
                type="radio"
                value="onDate"
                checked={endOption === 'onDate'}
                onChange={() => setEndOption('onDate')}
                className="mr-2"
              />
              指定日に終了
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="afterOccurrences"
                checked={endOption === 'afterOccurrences'}
                onChange={() => setEndOption('afterOccurrences')}
                className="mr-2"
              />
              指定回数後に終了
            </label>
          </div>
        </div>

        {endOption === 'onDate' && (
          <div>
            <label htmlFor="endDate" className="block mb-1">終了日:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy/MM/dd"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}

        {endOption === 'afterOccurrences' && (
          <div>
            <label htmlFor="occurrences" className="block mb-1">繰り返し回数:</label>
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
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            キャンセル
          </button>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editingTask ? '更新' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};


export default App;