const 
    totalItemsColumn = new Column("items", {
        merge (data, oldVal) {
            return oldVal ? oldVal + data.length : data.length
        },
        replace (data) {
            return data.length
        },
        remove (data, oldVal) {
            return oldVal ? oldVal - data.length : 0
        }
    }),


class Column {
    constructor (name) {
        this.name = name
    }

    validator () {
        return true
    }
}

class CompositeColumn {
    constructor (columns) {

    }
}

class ColumnFamily extends Map {
    constructor (columns, key) {
        this.columns = columns
        
        this.key = key

        this.map = new Map()
    }

    get (rowKey) {
        this.map.get(rowKey)
    }

    set (rowKey) {

    }
}

class WeakColumnFamily extends WeakMap {
    constructor (...args) {
        super(...args)

        this.map = new WeakMap()
    }
}

class ColumnFamilyAccessor {
    constructor (columnFamily) {
        this.columnFamily = columnFamily
    }

    get (rowKey) {
        this.columnFamily.get()
    }

    put (rowKey, data) {

    }

    delete (rowKey) {

    }
}

class keySpace {
    constructor (accessors) {
        for (let columnFamily in columnFamilies) {
            
        }
    }
}

[API_ENTITY.ID_KEY]: 
new WeakColumnFamily(
    null, // dynamic -- depends on what comprises an item
    new Column(API_ENTITY.ID_KEY)
),

[ENTITY.FILTERS]: 
new ColumnFamily(
    [
        new Column(ENTITY.TOTAL_ITEM_COUNT)
    ],
    new Column(API_ENTITY.FILTERS)
),

[API_ENTITY.PAGE]: 
new ColumnFamily(
    [
        new Column(API_ENTITY.ID_KEY)
    ],
    new CompositeColumn(
        [
            API_ENTITY.FILTERS,
            ENTITY.SORT_KEY, 
            ENTITY.SORT_DIRECTION, 
            API_ENTITY.PAGE_SIZE, 
            API_ENTITY.PAGE
        ].map(columnName => new Column(columnName))
    )
),
