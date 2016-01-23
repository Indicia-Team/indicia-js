//>>excludeStart('buildExclude', pragmas.buildExclude);
/*global define, m */
define(['helpers', 'Occurrence', 'Collection'], function () {
//>>excludeEnd('buildExclude');
  /***********************************************************************
   * SAMPLE
   *
   * Refers to the event in which the sightings were observed, in other
   * words it describes the place, date, people, environmental conditions etc.
   * Within a sample, you can have zero or more occurrences which refer to each
   * species sighted as part of the sample.
   **********************************************************************/

  m.Sample = (function () {

    var Module = Backbone.Model.extend({
      Occurrence: m.Occurrence,

      constructor: function (attributes, options){
        var attrs = attributes || {};

        var that = this;

        if (!attributes) {
          attrs = {
            date: new Date(),
            location_type: 'latlon'
          };
        }

        options || (options = {});
        this.cid = options.cid || m.getNewUUID();
        this.attributes = {};
        if (options.collection) this.collection = options.collection;
        if (options.parse) attrs = this.parse(attrs, options) || {};
        attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
        this.set(attrs, options);
        this.changed = {};


        if (options.metadata) {
          this.metadata = options.metadata;
        } else {
          this.metadata = {
            created_on: new Date(),
            updated_on: new Date(),

            warehouse_id: null,

            synced_on: null, //set when fully initialized only
            server_on: null //updated on server
          };
        }

        if (options.occurrences) {
          var occurrences = [];
          _.each(options.occurrences, function (occ) {
            if (occ instanceof that.Occurrence) {
              occurrences.push(occ);
            } else {
              occurrences.push(new that.Occurrence(occ.attributes, occ));
            }
          });
          this.occurrences = new m.Collection(occurrences, {
            model: this.Occurrence
          });
        } else {
          this.occurrences = new m.Collection([], {
            model: this.Occurrence
          });
        }

        this.initialize.apply(this, arguments);
      },

      /**
       * Returns an object with attributes and their values flattened and
       * mapped for warehouse submission.
       *
       * @param flattener
       * @returns {*}
       */
      flatten: function (flattener) {
        var flattened = flattener.apply(this, [Module.keys, this.attributes]);

        //occurrences
        _.extend(flattened, this.occurrences.flatten(flattener));
        return flattened;
      },

      toJSON: function () {
        var data = {
          id: this.id,
          cid: this.cid,
          metadata: this.metadata,
          attributes: this.attributes,
          occurrences: this.occurrences.toJSON()
        };

        return data;
      },

      /**
       * Sync statuses:
       * synchronising, synced, local, server, changed_locally, changed_server, conflict
       */
      getSyncStatus: function () {
        var meta = this.metadata;
        //on server
        if (meta.synchronising) {
          return m.SYNCHRONISING;
        }

        if (meta.warehouse_id) {
          //fully initialized
          if (meta.synced_on) {
            //changed_locally
            if (meta.synced_on < meta.updated_on) {
              //changed_server - conflict!
              if (meta.synced_on < meta.server_on) {
                return m.CONFLICT;
              }
              return m.CHANGED_LOCALLY;
              //changed_server
            } else if (meta.synced_on < meta.server_on) {
              return m.CHANGED_SERVER;
            } else {
              return m.SYNCED;
            }
            //partially initialized - we know the record exists on
            //server but has not yet been downloaded
          } else {
            return m.SERVER;
          }
          //local only
        } else {
          return m.LOCAL;
        }
      },

      /**
       * Detach all the listeners.
       */
      offAll: function () {
        this._events = {};
        this.occurrences.offAll();
        for (var i = 0; i < this.occurrences.data.length; i++) {
          this.occurrences.models[i].offAll();
        }
      }

    });

    /**
     * Warehouse attributes and their values.
     */
    Module.keys =  {
      id: { id: 'id' },
      survey: { id: 'survey_id' },
      date: { id: 'date' },
      comment: { id: 'comment' },
      image: { id: 'image' },
      location: { id: 'entered_sref' },
      location_type: {
        id: 'entered_sref_system',
        values: {
          british: 'OSGB', //for British National Grid
          irish: 'OSIE', //for Irish Grid
          latlon: 4326 //for Latitude and Longitude in decimal form (WGS84 datum)
        }
      },
      location_name: { id: 'location_name' },
      deleted: { id: 'deleted' }
    };

    return Module;
  }());
//>>excludeStart('buildExclude', pragmas.buildExclude);
});
//>>excludeEnd('buildExclude');