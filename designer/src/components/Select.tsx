import React from "react";
import { ChangeEventHandler } from "react";

function Select(props: IProps) {
    const id = "select-frm-" + props.label; 
    return (
        <div>
            <label htmlFor={id}>{props.label}</label>
            <div className="h-12">
                <select id={id} className="decoration rounded-md shadow-md w-full pl-3 h-full border-2 border-zinc-600 bg-charcoal" value={props.value} onChange={props.onChange}>
                    {
                        props.children
                    }
                </select>
            </div>
        </div>
    );
}

interface IProps {
    label: string,
    value: string,
    onChange: ChangeEventHandler<HTMLSelectElement>,
    children: React.ReactNode
}

export default Select;