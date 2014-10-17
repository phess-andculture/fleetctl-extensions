var _ = require("lodash");
var executor = require([__dirname, "executor"].join("/"));
var utils = require([__dirname, "utils"].join("/"));

module.exports = {

    list_machines: function(fn){
        var sub_command = ["list-machines", "--full", "--no-legend"].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            var machines = [];

            if(_.isNull(err)){
                _.each(response.split("\n"), function(line){
                    var parsed = _.map(line.replace(/\t+/g, "\t").split("\t"), function(value){
                        if(value == "-")
                            return null;
                        else
                            return value;
                    });
                    if(parsed.length == 3){
                        var machine = {
                            machine: parsed[0],
                            ip: parsed[1],
                            metadata: utils.kv_to_obj(parsed[2])
                        }
                        machines.push(machine);
                    }
                });
            }

            fn(err, machines);
        });
    },

    list_units: function(fn){
        var sub_command = ["list-units", "-l", "-fields='unit,load,active,sub,machine'", "--no-legend"].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            var units = [];

            if(_.isNull(err)){
                _.each(response.split("\n"), function(line){
                    if(_.isEmpty(line))
                        return;
                    var parsed = _.map(line.replace(/\t+/g, "\t").split("\t"), function(value){
                        if(value == "-")
                            return null;
                        else
                            return value;
                    });
                    if(parsed.length == 7){
                        var machine = [null, null];
                        if(!_.isNull(parsed[6]))
                            machine = parsed[6].split("/");

                        var unit = {
                            unit: parsed[0],
                            state: parsed[1],
                            load: parsed[2],
                            active: parsed[3],
                            sub: parsed[4],
                            desc: parsed[5],
                            machine: machine[0],
                            ip: machine[1]
                        }
                        units.push(unit);
                    }
                    if(parsed.length == 5){
                        var machine = [null, null];
                        if(!_.isNull(parsed[4]))
                            machine = parsed[4].split("/");

                        var unit = {
                            unit: parsed[0],
                            load: parsed[1],
                            active: parsed[2],
                            sub: parsed[3],
                            machine: machine[0],
                            ip: machine[1]
                        }
                        units.push(unit);
                    }
                });
            }

            fn(err, units);
        });
    },

    submit: function(units, fn){
        if (_.isArray(units))
            units = units.join(" ");

        var sub_command = ["submit", units].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            fn(err);
        });
    },

    start: function(units, options, fn){
        if (_.isArray(units))
            units = units.join(" ");

        if (_.isArray(options))
            options = options.join(" ");
        else if (_.isFunction(options))
            fn = options, options = "";
        else if (_.isNull(options))
            options = "";

        var sub_command = ["start", options, units].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            fn(err);
        });
    },

    stop: function(units, options, fn){
        if (_.isArray(units))
            units = units.join(" ");

        if (_.isArray(options))
            options = options.join(" ");
        else if (_.isFunction(options))
            fn = options, options = "";
        else if (_.isNull(options))
            options = "";

        var sub_command = ["stop", options, units].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            fn(err);
        });
    },

    destroy: function(units, fn){
        if (_.isArray(units))
            units = units.join(" ");

        var sub_command = ["destroy", units].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            fn(err);
        });
    },

    unit_status: function(name, fn){
        var sub_command = ["status", name].join(" ");

        executor.execute(this.binary, sub_command, this.timeout, function(err, response){
            var image = '';
            if(_.isNull(err)){
                _.each(response.split("\n"), function(line){
                    if(_.isEmpty(line))
                        return;
                    var parsed = _.map(line.replace(/\t+/g, "\t").split("\t"), function(value){
                                if(value == "-")
                                    return null;
                                else
                                    return value;
                            }),
                        regex = /\/usr\/bin\/docker run.*(\s[\w.-]*\/[\w.-]*\/[\w.-]*(?!\/docker)[\s|$]?)/,
                        match = regex.exec(parsed.toString());

                    if (match && match.length > 1 && match[1] && match[1] !== '') {
                        image = match[1].trim();
                    }
                });
            }
            fn(err, image);
        });
    }
}
