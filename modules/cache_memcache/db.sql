-- Cache using memcached --
-- Requires:
-- * memcached  (http://memcached.org/)
-- * pgmemcache (http://pgfoundry.org/projects/pgmemcache)

-- Cache functions --
-- cache_insert(id, k, v[, depend][, outdate])
--   inserts a key/value pair into the cache
--   - id is the string representation of an object (e.g. 'rel_1234'). If this
--     object already exists in the cache, it will be updated
--   - k is the key (a string)
--   - v is a value and will be handled as string
--   - depend is an array of depending objects, e.g. a the geometric
--     representation of a way depends on the way and it's nodes. You don't
--     have to add the id of the object to the depend-array.
--   - outdate specifies an interval after which the content will be
--     deprecated. Specify the interval as pgsql interval, 
--     e.g. '5 days 3 hours'. Defaults to '1 month'.
--   - returns the value
-- Example: cache_insert('rel_1234', 'foo', 'bar', Array['node_1'], '1 hour');
-- 
-- cache_search(id, k)
--   returns a cached value for this object, if no value exists 'null' is
--   returned
-- Example: cache_search('rel_1234', 'foo') -> 'bar'
--
-- cache_remove(id)
--   deletes all values which belong to this object or depend on it
-- Example: cache_remove('node_1')
--
-- cache_clean()
--   removes all outdated entries