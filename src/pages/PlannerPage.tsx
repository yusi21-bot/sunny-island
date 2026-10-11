"use client";

import { DragEvent as ReactDragEvent, useMemo, useState } from "react";
import { AppState, PageId, PersonId, ScheduleItem, Task, localDate, personMeta } from "../data";
import { CLASS_SUNLIGHT, ROW_HEIGHT, TaskDraft, TaskPatch } from "../constants";
import { addDays, dateFromIso, eventStyle, mondayOf, minutesToTime, plannerHours, plannerStartHour, scheduleDuration, timeToMinutes, weekdayNumber } from "../utils";
import { DraggableTask, ScheduleEditor, TaskComposer, TaskEditor } from "../components/SharedUI";

export function PlannerPage({ state, onAdd, onUpdateTask, onDeleteTask, onScheduleTask, onToggle, onUpdateSchedule, onMoveSchedule, onDeleteSchedule }: { state: AppState; onAdd: (draft: TaskDraft) => void; onUpdateTask: (id: string, patch: TaskPatch, message?: string) => void; onDeleteTask: (id: string) => void; onScheduleTask: (id: string, date: string, start: string) => void; onToggle: (task: Task) => void; onUpdateSchedule: (id: string, patch: Partial<ScheduleItem>) => void; onMoveSchedule: (id: string, sourceDay: number, targetDay: number, start: string) => void; onDeleteSchedule: (id: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const weekStart = useMemo(() => addDays(mondayOf(dateFromIso(localDate())), weekOffset * 7), [weekOffset]);
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const unscheduled = state.tasks.filter((task) => !task.scheduledDate);
  const selectedTask = state.tasks.find((task) => task.id === selectedTaskId);
  const selectedSchedule = state.schedule.find((item) => item.id === selectedScheduleId);
  const weekEnd = weekDates[6];
  const startHour = plannerStartHour(state.habits.wakeTime);
  const hours = plannerHours(startHour);
  const trackHeight = hours.length * ROW_HEIGHT;

  const handleDrop = (event: ReactDragEvent, date: Date, hour: number) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("application/x-family-task");
    if (taskId) onScheduleTask(taskId, localDate(date), `${String(hour).padStart(2, "0")}:00`);
    const schedulePayload = event.dataTransfer.getData("application/x-family-schedule");
    if (schedulePayload) {
      const [id, sourceDay] = schedulePayload.split("|");
      onMoveSchedule(id, Number(sourceDay), weekdayNumber(date), `${String(hour).padStart(2, "0")}:00`);
    }
  };

  return <section className="product-page planner-page">
    <header className="planner-compact-header"><div><b>家庭计划</b><span>{weekStart.getMonth() + 1} 月 {weekStart.getDate()} 日 — {weekEnd.getMonth() + 1} 月 {weekEnd.getDate()} 日</span></div><div className="week-switch"><button onClick={() => setWeekOffset((value) => value - 1)} aria-label="上一周">←</button><button onClick={() => setWeekOffset(0)}>本周</button><button onClick={() => setWeekOffset((value) => value + 1)} aria-label="下一周">→</button></div></header>
    <div className="planner-layout">
      <aside className="task-dock">
        <div className="dock-heading"><span className="overline">任务背包</span><h2>带上这周的任务卡</h2><p>新任务会先放进背包，再拖到右侧航线。</p></div>
        <TaskComposer currentUser={state.currentUser} onAdd={onAdd} />
        <div className="task-pool">{unscheduled.length ? unscheduled.map((task) => <DraggableTask key={task.id} task={task} onClick={() => setSelectedTaskId(task.id)} />) : <div className="pool-empty"><span /><b>都安排好了</b><small>新的任务会先出现在这里</small></div>}</div>
      </aside>
      <section className="week-board" aria-label="周计划时间表">
        <div className="week-head"><span /><>{weekDates.map((date) => <div className={localDate(date) === localDate() ? "today" : ""} key={localDate(date)}><b>{["一", "二", "三", "四", "五", "六", "日"][weekdayNumber(date) - 1]}</b><small>{date.getMonth() + 1}/{date.getDate()}</small></div>)}</></div>
        <div className="week-scroll">
          <div className="time-axis" style={{ height: `${trackHeight}px` }}>{hours.map((hour) => <span key={hour} style={{ top: `${(hour - startHour) * ROW_HEIGHT}px` }}>{String(hour).padStart(2, "0")}:00</span>)}</div>
          {weekDates.map((date) => {
            const dateKey = localDate(date);
            const dayNumber = weekdayNumber(date);
            return <div className={`day-track route-track ${dateKey === localDate() ? "today" : ""} ${dateKey < localDate() ? "past" : ""}`} style={{ height: `${trackHeight}px` }} key={dateKey}>
              {hours.map((hour) => <div className="drop-hour route-drop" key={hour} style={{ top: `${(hour - startHour) * ROW_HEIGHT}px`, height: `${ROW_HEIGHT}px` }} onDragOver={(event) => { event.preventDefault(); event.currentTarget.classList.add("drag-over"); }} onDragLeave={(event) => event.currentTarget.classList.remove("drag-over")} onDrop={(event) => { const target = event.currentTarget; target.classList.remove("drag-over"); target.classList.add("landed"); window.setTimeout(() => target.classList.remove("landed"), 650); handleDrop(event, date, hour); }}><span>放在 {String(hour).padStart(2, "0")}:00</span><i /><i /><i /></div>)}
              {state.schedule.filter((item) => item.days.includes(dayNumber) && dateKey <= item.until).map((item) => <button key={`${item.id}-${dateKey}`} className={`calendar-event fixed route-station ${item.tone}`} style={eventStyle(item.start, scheduleDuration(item), startHour)} onClick={() => setSelectedScheduleId(item.id)} draggable onDragStart={(event) => event.dataTransfer.setData("application/x-family-schedule", `${item.id}|${dayNumber}`)}><span>固定课程</span><b>{item.title}</b><small>{item.start}—{item.end}</small></button>)}
              {state.tasks.filter((task) => task.scheduledDate === dateKey).map((task) => <button key={task.id} className={`calendar-event task route-card owner-${task.owner} ${task.completed ? "completed" : ""}`} style={eventStyle(task.start ?? `${String(startHour).padStart(2, "0")}:00`, task.duration ?? 60, startHour)} onClick={() => setSelectedTaskId(task.id)} draggable onDragStart={(event) => event.dataTransfer.setData("application/x-family-task", task.id)}><em>{task.subject}</em><b>{task.title}</b><small>{task.start} · {personMeta[task.owner].name}</small></button>)}
            </div>;
          })}
        </div>
      </section>
    </div>
    {selectedTask && <TaskEditor task={selectedTask} onClose={() => setSelectedTaskId(null)} onSave={(patch) => { onUpdateTask(selectedTask.id, patch); setSelectedTaskId(null); }} onDelete={() => { onDeleteTask(selectedTask.id); setSelectedTaskId(null); }} onToggle={() => onToggle(selectedTask)} />}
    {selectedSchedule && <ScheduleEditor item={selectedSchedule} onClose={() => setSelectedScheduleId(null)} onSave={(patch) => { onUpdateSchedule(selectedSchedule.id, patch); setSelectedScheduleId(null); }} onDelete={() => { onDeleteSchedule(selectedSchedule.id); setSelectedScheduleId(null); }} />}
  </section>;
}
