/*
    SPDX-FileCopyrightText: 2021 Vincent Grabner <frankenfruity@protonmail.com>
    SPDX-License-Identifier: GPL-2.0-or-later
*/
import QtQuick 2.0

QtObject {
    id: sensorObj
    objectName: "Sensor"

    signal valueChangedCustom(QtObject sensor)

    property string sensor: ""
    property var value: undefined
    property string unit: ""
    property var print_func: undefined
    property var rw_mode: undefined
    property string sensor_type: ""

    function copy(sensor) {
        sensorObj.sensor = sensor.sensor
        sensorObj.value = sensor.value
        sensorObj.unit = sensor.unit
        sensorObj.print_func = sensor.print_func
        sensorObj.rw_mode = sensor.rw_mode
        sensorObj.sensor_type = sensor.sensor_type
        return sensorObj
    }

    function getValueText(value) {
        if (print_func === undefined) {
            return value ? value.toString() : sensorObj.value.toString()
        }

        var obj = {'value': (value !== undefined ? value : sensorObj.value), 'unit': unit}
        return print_func(obj)
    }

    onValueChanged: {
        /* emit */ valueChangedCustom(sensorObj)

    }

    function emitValueChanged() {
        // emit onValueChanged
        value = value
    }
}
