function addCategory(name) {
    if (global.db.category_menu.includes(name)) return {
        status: false,
        message: 'Category tersebut sudah ada didalam database'
    }
    global.db.category_menu.push(name)
    return {
        status: true,
        message: 'Berhasil menambahkan category *' + name + '*'
    }
}

function deleteCategory(name) {
    if (!global.db.category_menu.includes(name)) return {
        status: false,
        message: 'Category tersebut tidak ada didalam database'
    }
    let index = global.db.category_menu.indexOf(name)
    global.db.category_menu.splice(index, 1)
    return {
        status: true,
        message: 'Berhasil menghapus menu category *' + name + '*'
    }
}

module.exports = {
    addCategory,
    deleteCategory
}