define([
  'lib/underscore',
  'lib/backbone',
  'component/grid/projection/base',
], function (_, Backbone, BaseProjection) {
  var Model = BaseProjection.extend({
    defaults: {
      'row.classes': {},
    },
    name: 'row',
    update: function (options) {
      if (Model.__super__.update.call(this, options)) {
        var model = this.src.data;
        var rows = model.get('value');

        _.each(rows, row => {
          var type = _.chain(row).result('$metadata').result('type').value();

          if (_.isUndefined(type)) {
            row.$metadata = _.extend({}, row.$metadata, {
              type: 'row',
            });
          }
        });

        _.each(rows, (row) => {
          var classArr = [];
          var classesRule = this.get('row.classes');

          var checkId = this.get('row.check.id');
          var checkboxAllow = model.get('row.check.allow');

          _.each(classesRule, (func, key) => {
            var originClass = _.chain(row)
              .result('$metadate')
              .result('attr')
              .result('class')
              .value();

            if (originClass) {
              classArr.push(originClass);
            }

            var type = _.chain(row).result('$metadata').result('type').value();

            if (_.isFunction(func) && func(row, type)) {
              classArr.push(key);
            }
          });
          
          //attr info from meta 
          var originId = _.chain(row)
            .result('$metadate')
            .result('attr')
            .result('id')
            .value();

          if (_.isFunction(checkboxAllow) ? checkboxAllow(row) : checkboxAllow) {
            var a11yPrefix = model.get('a11y.rowcheck.idPrefix');
            var id = row[checkId] || originId;
            var a11yId = a11yPrefix.concat(id);
            var role = 'row';
          }

          _.extend(row, {
            $metadata: {
              attr: _.pick({
                class: _.flatten(classArr).join(' '),
                id: a11yId,
                role: role,
              }, Boolean),
            },
          });
        });

        this.patch({ value: rows });
      }
    },
  });

  return Model;
});
