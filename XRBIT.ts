/**
 * 使用此文件来定义自定义函数和图形块。
 * 想了解更详细的信息，请前往 https://makecode.microbit.org/blocks/custom
 */

/**
 * 自定义图形块
 */

/*****************************************************************************************************************************************
 *  传感器类 ***************************************************************************************************************************** 
 ****************************************************************************************************************************************/

//% color="#87CEEB" weight=24 icon="\uf1b6"
namespace XRbit_传感器 {

    export enum enVoice {
        //% blockId="Voice" block="Voice"
        Voice = 0,
        //% blockId="NoVoice" block="NoVoice"
        NoVoice = 1
    }

    export enum enIR {
        //% blockId="Get" block="Get"
        Get = 0,
        //% blockId="NoVoice" block="NoVoice"
        NoGet = 1
    }


    export enum enBuzzer {
        //% blockId="NoBeep" block="NoBeep"
        NoBeep = 0,
        //% blockId="Beep" block="Beep"
        Beep
    }
    export enum irPin {
        //% blockId="ir_Left" block="Left_IR_P12"
        ir_Left = 1,
        //% blockId="ir_Right" block="Right_IR_P14"
        ir_Right = 2,
        //% blockId="ir_Avoid" block="Avoid_IR_P13"
        ir_Avoid = 3
    }

    //% blockId=XRbit_Buzzer block="Buzzer|pin %pin|value %value"
    //% weight=100
    //% blockGap=10
    //% color="#87CEEB"
    //% value.min=0 value.max=1
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Buzzer(pin: DigitalPin, value: enBuzzer): void {
        pins.setPull(pin, PinPullMode.PullNone);
        pins.digitalWritePin(pin, value);
    }

    //% blockId=XRbit_IR_Sensor block="IR_Sensor|pin %pin| |%value|障碍物"
    //% weight=100
    //% blockGap=10
    //% color="#87CEEB"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function IR_Sensor(pin: irPin, value: enIR): boolean {
        let Pin:DigitalPin;
        if(pin==1)
        {
            Pin = DigitalPin.P12;
        }
        if(pin==2)
        {
            Pin = DigitalPin.P14;
        }
        if(pin==3)
        {
            Pin = DigitalPin.P13;
        }

        pins.setPull(Pin, PinPullMode.PullUp);
        if (pins.digitalReadPin(Pin) == value) {
            return true;
        }
        else {
            return false;
        }
    }

    //% blockId=XRbit_ultrasonic block="Ultrasonic|Trig %Trig|Echo %Echo"
    //% color="#87CEEB"
    //% weight=100
    //% blockGap=10
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function Ultrasonic(Trig: DigitalPin, Echo: DigitalPin): number {
        // send pulse
        let list:Array<number> = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
            pins.setPull(Trig, PinPullMode.PullNone);
            pins.digitalWritePin(Trig, 0);
            control.waitMicros(2);
            pins.digitalWritePin(Trig, 1);
            control.waitMicros(15);
            pins.digitalWritePin(Trig, 0);

            let d = pins.pulseIn(Echo, PulseValue.High, 43200);
            list[i] = Math.floor(d / 40)
        }
        list.sort();
        let length = (list[1] + list[2] + list[3])/3;
        return  Math.floor(length);
    }
}

/*****************************************************************************************************************************************
 *  小车类 ***************************************************************************************************************************** 
 ****************************************************************************************************************************************/

//% weight=5 color=#9900CC icon="\uf1b9"
namespace XRbit_小车 {
    const XRBIT_ADDRESS = 0x17
    let xrStrip: neopixel.Strip;
    export enum enMotor {
        //% blockId="leftMotor" block="leftMotor"
        leftMotor = 0x14,
        //% blockId="rightMotor" block="rightMotor"
        rightMotor = 0x15,
        //% blockId="SweepingMotor" block="SweepingMotor"
        SweepingMotor = 0x18,      

    }

    export enum enCarLight {
        //% blockId="openCarLight" block="openCarLight"
        openCarLight = 1,
        //% blockId="closeCarLight" block="closeCarLight"
        closeCarLight = 0,    
    }


    function i2cwrite(addr: number, reg: number, value: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(addr, buf);
    }

    function i2cread(addr: number, reg: number): number {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function LowToneTrans( tone:string ):number{
        if(tone == "000")
            return 131
        else if(tone == "001")
            return 147
        else if(tone == "002")
            return 165
        else if(tone == "003")
            return 175
        else if(tone == "004")
            return 196
        else if(tone == "005")
            return 220
        else if(tone == "006")
            return 247
        return 0
    }

    function MidToneTrans( tone:string ):number{
        if(tone == "000")
            return 262
        else if(tone == "001")
            return 294
        else if(tone == "002")
            return 330
        else if(tone == "003")
            return 349
        else if(tone == "004")
            return 392
        else if(tone == "005")
            return 440
        else if(tone == "006")
            return 494
        return 0
    }

    function HighToneTrans( tone:string ):number{
        if(tone == "000")
            return 523
        else if(tone == "001")
            return 587
        else if(tone == "002")
            return 659
        else if(tone == "003")
            return 698
        else if(tone == "004")
            return 784
        else if(tone == "005")
            return 880
        else if(tone == "006")
            return 988
        return 0
    }
    // 黑键
    function BlackLowToneTrans( tone:string ):number{
        if(tone == "000")
            return 139
        else if(tone == "001")
            return 156
        else if(tone == "002")
            return 185
        else if(tone == "003")
            return 208
        else if(tone == "004")
            return 233
        return 0
    }
    function BlackMidToneTrans( tone:string ):number{
        if(tone == "000")
            return 277
        else if(tone == "001")
            return 311
        else if(tone == "002")
            return 370
        else if(tone == "003")
            return 415
        else if(tone == "004")
            return 466
        return 0
    }
    function BlackHighToneTrans( tone:string ):number{
        if(tone == "000")
            return 554
        else if(tone == "001")
            return 622
        else if(tone == "002")
            return 740
        else if(tone == "003")
            return 831
        else if(tone == "004")
            return 932
        return 0
    }

    //% blockId=XRbit_PlayThePiano block="key| %key tone(Format:000)| %tone"
    //% weight=94
    //% blockGap=10
    //% color="#0fbc11"
    export function PlayThePiano(key: string, tone: string): void {   
        if(key == "1")
            music.playTone(LowToneTrans(tone),music.beat(BeatFraction.Whole))
        if(key == "2")
            music.playTone(MidToneTrans(tone),music.beat(BeatFraction.Whole))
        if(key == "3")
            music.playTone(HighToneTrans(tone),music.beat(BeatFraction.Whole))
        if(key == "4")
            music.playTone(BlackLowToneTrans(tone),music.beat(BeatFraction.Whole))
        if(key == "5")
            music.playTone(BlackMidToneTrans(tone),music.beat(BeatFraction.Whole))
        if(key == "6")
            music.playTone(BlackHighToneTrans(tone),music.beat(BeatFraction.Whole))
    }

    //% blockId=XRbit_SetCarLight block="SetCarLight|pin %pin |%carLight"
    //% weight=94
    //% blockGap=10
    //% color="#0fbc11"
    export function SetCarLight(pin: DigitalPin, carLight: enCarLight): void {   
            pins.digitalWritePin(pin, carLight);      
    }

    //% blockId=XRbit_SetMotor block="SetMotor|Motor %Motor|Speed %Speed"
    //% weight=94
    //% blockGap=10
    //% color="#0fbc11"
    //% Speed.min=-100 Speed.max=100
    export function SetMotor(Motor: enMotor, Speed: number): void {
        let buf1 = pins.createBuffer(2);
        let buf2 = pins.createBuffer(2);
        buf1[0] = 0xFF;
        buf1[1] = Motor;
        buf2[0] = Speed+100;
        buf2[1] = 0xFF;
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf1);
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf2);
    }

    export enum enServo{
        //% blockId="servo1" block="servo1"
        servo1 = 0x19,
        //% blockId="servo2" block="servo2"
        servo2 = 0x1A,
        //% blockId="servo3" block="servo3"
        servo3 = 0x1B,
    }
 

    //% blockId=XRBIT_SetServoAngle block="SetServoAngle| %servo|Angle %Angle"
    //% weight=94
    //% blockGap=10
    //% color="#0fbc11"
    //% Angle.min=0 Angle.max=180
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=9
    export function SetServoAngle(servo: enServo, Angle: number): void {
        let buf1 = pins.createBuffer(2);
        let buf2 = pins.createBuffer(2);
        buf1[0] = 0xFF;
        buf1[1] = servo;
        buf2[0] = Angle;
        buf2[1] = 0xFF;
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf1);
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf2);
    }

    //% blockId=XRBIT_ReSetServoAngle block="ReSetServoAngle"
    //% weight=94
    //% blockGap=10
    //% color="#0fbc11"
    export function ReSetServoAngle(): void {
        let buf1 = pins.createBuffer(2);
        let buf2 = pins.createBuffer(2);
        buf1[0] = 0xFF;
        buf1[1] = 0x00;
        buf2[0] = 0x01;
        buf2[1] = 0xFF;
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf1);
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf2);
    }
    //% blockId=XRBIT_SaveServoAngle block="SaveServoAngle"
    //% weight=94
    //% blockGap=10
    //% color="#0fbc11"
    export function SaveServoAngle(): void {
        let buf1 = pins.createBuffer(2);
        let buf2 = pins.createBuffer(2);
        buf1[0] = 0xFF;
        buf1[1] = 0x11;
        buf2[0] = 0x01;
        buf2[1] = 0xFF;
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf1);
        pins.i2cWriteBuffer(XRBIT_ADDRESS,buf2);
    }


    //% blockId=XRit_RGB_Car_Program block="RGB_Car_Program"
    //% weight=99
    //% blockGap=10
    //% color="#0fbc11"
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
    export function RGB_Car_Program(): neopixel.Strip {
         
        if (!xrStrip) {
            xrStrip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB);
        }
        return xrStrip;
    }
}