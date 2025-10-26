import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { Calendar } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
    <div
        onClick={onClick}
        ref={ref}
        className="flex items-center gap-2 bg-black/40 p-2 rounded-xl shadow-inner cursor-pointer w-32 flex-shrink-0"
    >
        <Calendar size={18} className="text-orange-500 flex-shrink-0" />
        <span className="text-white truncate">{value || placeholder}</span>
    </div>
));
function filterByDate(issue, startDate, endDate) {
    if (!startDate && !endDate) return true;

    const created = new Date(issue.created_at);

    if (startDate && endDate) {
        return created >= startDate && created <= endDate;
    }
    if (startDate) return created >= startDate;
    if (endDate) return created <= endDate;

    return true;
}

export default function DateRangePicker({ startDate, endDate, onChangeStart, onChangeEnd }) {
    return (
        <div className="flex gap-4">
            <DatePicker
                selected={startDate}
                onChange={onChangeStart}
                dateFormat="dd/MM/yyyy"
                placeholderText="Data inicial"
                customInput={<CustomInput placeholder="Data inicial" />}
                withPortal
                portalId="datepicker-portal"
                popperClassName="!bg-transparent"
            />
            <span className="text-white font-bold">_</span>
            <DatePicker
                selected={endDate}
                onChange={onChangeEnd}
                dateFormat="dd/MM/yyyy"
                placeholderText="Data final"
                customInput={<CustomInput placeholder="Data final" />}
                withPortal
                portalId="datepicker-portal"
                popperClassName="!bg-transparent"
            />
        </div>
    );
}