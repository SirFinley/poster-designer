import React from 'react';
import './tooltip.css';

export default function Tooltip({ children, text }: IProps) {
    return (
        <div className="tooltip">
            {children}
            <span className="tooltiptext"> {text} </span>
        </div>
    );
};

interface IProps {
    children: React.ReactNode,
    text: string,
}