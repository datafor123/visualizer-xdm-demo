import React, {useEffect, useRef } from 'react';
import './App.css';
import {Tooltip, Select, DatePicker, Button } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';

import XMDWorker, {XDMMessageDataType, DataIncludeTypeEnum, MemberValueType, MemberValueTypeEnum, MemberFieldTypeEnum} from './send.xdm';

const { RangePicker } = DatePicker;
const ctrlParams = [ 
  `__xdmTimeout=150` //Waiting time for init control message send to iframe, unit: ms
];
const reportAddr = `https://aws.datafor.com.cn:448/datafor/plugin/datafor/api/share/open?shareid=Z0ZrY1g2XGDqY1kxKIDxeI2`;

// Simulated data. You can replace it with your own data.
const SIMULATEDATA = {
  productFamilies: ['Drink', 'Food', 'Non-Consumable'],  
  defaultFamily: ['Non-Consumable'],
  productFamilyUniqueName: '[product_class].[hierarchy_product_family].[product_family]', //The uniqueName of the product family level in report analysis model

  dateUniqueName: '[time_by_day].[AGG_the_date].[the_date@@DAYS]', //The uniqueName of the date level in report analysis model
  defaultDate: {
    start: dayjs('1997-3-5').startOf('date').valueOf(),
    end: dayjs('1997-3-20').endOf('date').valueOf()
  }
}
type EncodeQueryType = {
  defaultFamily:Array<string>, 
  defaultDate:{start:number, end: number}
}
const encodeQueryString = (data:EncodeQueryType) =>{
  const { defaultFamily: p, defaultDate: d } = data;
  const sender:Array<XDMMessageDataType> = [{
    value: [[{ i: 1, v: d.start.valueOf() }, { i: 1, v: d.end.valueOf() }]],
    name: SIMULATEDATA.dateUniqueName,
    type: MemberFieldTypeEnum.NAME,
    datatype: MemberValueTypeEnum.TIMESTAMP
  }];
  if (p.length > 0) {
    sender.push({
      value: [...p],
      name: SIMULATEDATA.productFamilyUniqueName,
      type: MemberFieldTypeEnum.NAME,
      datatype: MemberValueTypeEnum.STRING 
    });
  }
  return sender;
};

const useButtonEnable = (init:boolean)=>{
  const [enable, setEnable] = React.useState(init);
  const history = useRef<string>(JSON.stringify(encodeQueryString(SIMULATEDATA)));
  const update = (sender:EncodeQueryType)=>setEnable(history.current !== JSON.stringify(encodeQueryString(sender)));
  const commit = (sender:EncodeQueryType)=> {
    history.current = JSON.stringify(encodeQueryString(sender));
    setEnable(false);
  }
  return {
    enable,
    update,
    commit
  }
}

function App():JSX.Element {
  const iframeRef = React.createRef<HTMLIFrameElement>();
  const xdm = useRef<XMDWorker>();  
  const { enable, update, commit } = useButtonEnable(false);
  useEffect(() => {
    xdm.current = new XMDWorker({
      onPageInitEvent: () => iframeRef?.current && xdm?.current?.send(encodeQueryString(SIMULATEDATA), iframeRef.current.contentWindow as Window, true)});
  }, []);

  return (
      <div className="App">
        <div className="panel">
          <span>Product Family</span>
          <Select 
            placeholder="Product Family" 
            defaultValue={SIMULATEDATA.defaultFamily} 
            style={{ width: 540, marginRight: 10 }} 
            mode="multiple" 
            maxTagCount={2} 
            onChange={vals => {
              SIMULATEDATA.defaultFamily = vals.map(o => o).sort();
              update(SIMULATEDATA);
            }}
          >
            {SIMULATEDATA.productFamilies.map(member=> <Select.Option key={member}>{member}</Select.Option>)}
          </Select>
          <span>Date</span>
          <RangePicker 
            locale={locale} 
            defaultValue={[dayjs(SIMULATEDATA.defaultDate.start), dayjs(SIMULATEDATA.defaultDate.end)]} 
            onCalendarChange={([start, end]) =>{
              if(start && end){
                SIMULATEDATA.defaultDate = { start: start.startOf('date').valueOf(), end: end.endOf('date').valueOf() }
              }
              update(SIMULATEDATA);
            }}
          />
          <Tooltip title="First modify your filter criteria, and then click here to submit.">
            <Button type="primary" disabled={!enable} style={{ marginLeft: 10 }} onClick={() => {
              const senderMessage = encodeQueryString(SIMULATEDATA);
              xdm.current?.send(senderMessage, iframeRef?.current?.contentWindow as Window);
              commit(SIMULATEDATA);
            }}>Apply</Button>
          </Tooltip>
        </div>
        <div className="content">
          <iframe src={`${reportAddr}&${ctrlParams.join('&')}`} title="demo_xdm" width="100%" height="100%" frameBorder="0" ref={iframeRef}></iframe>
        </div>
      </div>
    );
};

export default App;
