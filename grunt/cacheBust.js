module.exports = {

    options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 16,
        deleteOriginals: true,
        assets: ['assets/css/*','assets/js/*'],
        baseDir: 'dist/public_html/'
    },

    src: ['dist/public_html/index.html']

};