var exec = require('child_process').exec;

module.exports = {

    execute: function(binary, sub_command, timeout, fn){
        exec([binary, sub_command].join(" "), { timeout: timeout }, function(err, stdout, stderr){
            if(err || stderr){
                if(!err)
                    err = new Error(stderr);
            }

            fn(err, stdout);
        });
    }

}
