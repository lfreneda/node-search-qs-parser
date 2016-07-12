(function() {

    var moment = require('moment');

    var parsers = {

        'stringLike': function(rawValue) {
            return '%' + rawValue + '%';
        },

        'string': function(rawValue) {
            return rawValue;
        },

        'date': function(rawValue) {
            var dateValue;
            dateValue = moment(rawValue);
            return dateValue.format('YYYY-MM-DD');
        },

        'int': function(rawValue) {
            var values;
            values = rawValue.split(',');
            if (values.length > 1) {
                return values.map(function(value) {
                    return parseInt(value);
                });
            } else {
                return parseInt(values[0]);
            }
        }

    };

    var SearchQueryStringParser = (function() {

        function SearchQueryStringParser(args) {
            this.fields = args.fields;
            
            this.defaults = {
                limit: 25,
                offset: 0,
                order: 'id'
            };

            if (args.defaults.limit) {
                this.defaults.limit = args.defaults.limit;
                this.defaults.offset = args.defaults.offset;
            }
        }

        SearchQueryStringParser.prototype.parse = function(params) {
            var queryOptions, where;
            where = {};

            this.fields.forEach(function(f) {
                if (params[f.name] && parsers[f.type]) {
                    return where[f.name] = parsers[f.type](params[f.name]);
                }
            });

            queryOptions = {
                options: {
                    limit: params.limit || this.defaults.limit,
                    offset: params.offset || this.defaults.offset,
                    order: this.defaults.order
                },
                where: where
            };

            if (params.sort) {
                queryOptions.order = [
                    {
                        field: params.sort.replace('-', ''),
                        direction: params.sort.indexOf('-') === 0 ? 'desc' : 'asc'
                    }
                ];
            }

            return queryOptions;
        };

        return SearchQueryStringParser;

    })();

    module.exports = SearchQueryStringParser;

}).call(this);
