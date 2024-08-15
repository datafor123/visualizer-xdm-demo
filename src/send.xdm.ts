enum DataIncludeTypeEnum {
  INCLUDE = 1,
  EXCLUDE = 0
}

enum MemberValueTypeEnum { 
  STRING = 'string',
  TIMESTAMP = 'timestamp',
  NUMBER = 'numeric'
}
enum MemberFieldTypeEnum { 
  CAPTION = 'caption',
  NAME = 'name'
}
type RangeTupleCell = {
  i: DataIncludeTypeEnum,  
  v: number | string,  //The value of the filter
};
type RangeTule = [RangeTupleCell, RangeTupleCell];
type MemberValueType = RangeTule | string | number;

type XDMMessageDataType = {
  value: Array<MemberValueType>, //Parameter Value
  name: string,  //Parameter Name
  type: MemberFieldTypeEnum,  //Parameter Type
  datatype: MemberValueTypeEnum //Parameter Data Type
}


class XDMWorker {

    reportId:string|null;

    destroy:()=>void;

    constructor({ onPageInitEvent = () => { } }) {
        this.reportId = null;
        const onMessage = (msg: {data:string}) => {
            const { data } = msg;
            let reportMessage;
            try { reportMessage = JSON.parse(data); } catch (d) { }
            if (reportMessage) {
                if (reportMessage.event === 'visualizerReportFileLoaded') {//This is the message of the report initialization completion. It will carry an id value, which is the unique identifier of the report. Subsequent messages should carry this id value, otherwise the report will not be processed.
                    this.reportId = reportMessage.id;
                    onPageInitEvent();
                }
            }
        }
        window.addEventListener('message', onMessage);
        this.destroy = () => window.removeEventListener('message', onMessage);
    }

    /**
     * 
     * @param {Array} data  MessageData
     * @param {Window} target  Visualizer iframe window
     * @param {Boolean} init   Whether this messagedata is for the first query
     * @returns 
     */
    send(data:Array<XDMMessageDataType>, target:Window, init:boolean = false) {
        if (!this.reportId || !target) {
            return;
        }
        const message = {
            trustMark: this.reportId,
            event: 'query',
            init,
            filters: data,
        };
        target?.postMessage(JSON.stringify(message), '*');
    }

}

export const packageDaterangeMessage = (parameterName:string, parameterValue:Array<RangeTule>):Array<XDMMessageDataType> => {
  return [{
    value: parameterValue,
    name: parameterName,
    type: MemberFieldTypeEnum.NAME,
    datatype: MemberValueTypeEnum.TIMESTAMP
  }];
}

export const packageNormalMessage = (parameterName:string, parameterValue:Array<string>):Array<XDMMessageDataType> => {
  return [{
    value: parameterValue,
    name: parameterName,
    type: MemberFieldTypeEnum.NAME,
    datatype: MemberValueTypeEnum.STRING
  }];
}

export default XDMWorker;
export type {XDMMessageDataType, MemberValueType};
export {DataIncludeTypeEnum, MemberValueTypeEnum, MemberFieldTypeEnum};