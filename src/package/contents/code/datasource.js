
.import "utils.js" as Utils

function parse_sensor_data(obj, ctx) {
    var sensors_model = ctx.sensors_model
    var keys = Object.keys(obj);
    var changes = false
    for(var i=0; i< keys.length; i++) {
        if (!sensors_model[keys[i]]) {
            continue;
        }

        var rw_mode = sensors_model[keys[i]]['rw_mode']
        var old_val = sensors_model[keys[i]]['value']
        if (rw_mode == 'w'){
            if (old_val === undefined) {
                sensors_model[keys[i]]['value'] = true
            }
        } else {
            changes = changes || sensors_model[keys[i]]['value'] !== obj[keys[i]]
            sensors_model[keys[i]]['value'] = obj[keys[i]];
        }
    }

    return changes
}

function init_sensors_detected(sensors_model, sensors_detected) {
    var keys = Object.keys(sensors_model);
    for (var i = 0; i < keys.length; i++) {
        var sensor = sensors_model[keys[i]]
        if (sensor['value'] !== undefined && !sensors_detected.includes(keys[i])) {
            sensors_detected.push(keys[i])
        }
    }
}

// Parse the result of "set_prefs.sh -read-all" or "set_prefs.sh -read-some .."
function handle_read_result(args, stdout, ctx) {
    var obj = JSON.parse(stdout);

    print("handle_read_result args="+args)

    if (args[0] == '-read-some') {
        // Utils.remove_stale_data(obj, old_data, sensors_model);
        // old_data = obj
    }

    var changes = parse_sensor_data(obj, ctx)

    if(!ctx.isReady) {
        init_sensors_detected(ctx.sensors_model, ctx.sensors_detected);
        print("sensors_detected: ", ctx.sensors_detected)

        ctx.dataSourceReady();
        ctx.isReady = true;
    }

    if (changes) {
        ctx.sensorsValuesChanged();
    }

    return changes
}

// Parse the result of "set_prefs.sh -read-available"
function handle_read_avail_result(stdout, ctx) {
    var obj = JSON.parse(stdout);
    var keys = Object.keys(obj);
    for (var i=0; i < keys.length; i++) {
        var d = obj[keys[i]]
        var values = d.split(' ').filter(item => item.length > 0)
        ctx.available_values[keys[i]] = values
    }

    if (ctx.isReady) {
        ctx.dataSourceReady();
    }
}

// Parse the result from set_prefs.sh after setting a value
function handle_set_value(cmd, stdout, ctx) {
    var arg_0 = cmd
    arg_0 = arg_0.substring(1)
                 .split('-').join('_')
    if (ctx.sensors_detected.includes(arg_0)) {
        var obj = JSON.parse(stdout);
        var changes = parse_sensor_data(obj, ctx)
        if (changes) {
            ctx.sensorsValuesChanged();
        }
    }
}
