import {Tooltip, Select, DatePicker, Button } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import React, {useRef} from 'react';
const { RangePicker } = DatePicker;
export type PanelSelectedProps = {
  family: Array<string>;
  date: { start: number; end: number };
}
type PanelProps = {
  familiesList:Array<string>;
  defaults:PanelSelectedProps;
  onCommit:(msg:PanelSelectedProps)=>void;
}

const useButtonEnable = (init:boolean, defaults:PanelSelectedProps, onCommit:(msg:PanelSelectedProps)=>void)=>{
  const [enable, setEnable] = React.useState(init);
  const [current, setCurrent] = React.useState(defaults);
  const history = useRef<string>(JSON.stringify(defaults));
  const update = (sender:PanelSelectedProps)=>{
    setEnable(history.current !== JSON.stringify(sender));
    setCurrent(sender);
  }
  const commit = ()=> {
    history.current = JSON.stringify(current);
    setEnable(false);
    onCommit(current);
  }
  return {
    enable,
    current,
    update,
    commit
  }
}

const Panel = (props: PanelProps):JSX.Element=>{
  const {enable, update, current, commit} = useButtonEnable(false, props.defaults, props.onCommit);
  return (<div className="panel">
    <span>Product Family</span>
    <Select 
      placeholder="Product Family" 
      defaultValue={props.defaults.family} 
      style={{ width: 540, marginRight: 10 }} 
      mode="multiple" 
      maxTagCount={2} 
      onChange={vals => update({...current, family: vals.map(o => o).sort()})}
    >
      {props.familiesList.map(member=> <Select.Option key={member}>{member}</Select.Option>)}
    </Select>
    <span>Date</span>
    <RangePicker 
      locale={locale} 
      defaultValue={[dayjs(props.defaults.date.start), dayjs(props.defaults.date.start)]} 
      onCalendarChange={([start, end]) =>start && end && update({...current, date: { start: start.startOf('date').valueOf(), end: end.endOf('date').valueOf() }})}
    />
    <Tooltip title="First modify your filter criteria, and then click here to submit.">
      <Button type="primary" disabled={!enable} style={{ marginLeft: 10 }} onClick={() => {
        commit();
      }}>Apply</Button>
    </Tooltip>
  </div>)
}

export default Panel;