# imitation of this https://github.com/TooTallNate/node-vorbis/blob/master/common.gypi
{
  'variables': {
    'node_xmljs': '<!(node -p -e "require(\'path\').dirname(require.resolve(\'libxmljs-mt\'))")',
    'xmljs_include_dirs': [
      '<(node_xmljs)/src/',
      '<(node_xmljs)/vendor/libxml/include',
      '<(node_xmljs)/vendor/libxml.conf/include'
    ],
    'conditions': [
      ['OS=="win"', {
        'xmljs_libraries': [
          '<(node_xmljs)/build/$(Configuration)/xmljs.lib'
        ],
      }, {
        'xmljs_libraries': [
          '<(node_xmljs)/build/$(BUILDTYPE)/xmljs.node',
          '-Wl,-rpath,<(node_xmljs)/build/$(BUILDTYPE)'
        ],
      }],
    ],
  },
}