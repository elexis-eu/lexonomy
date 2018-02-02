{
  'variables': {
    'target_arch%': 'ia32', # build for a 32-bit CPU by default
    'xmljs_include_dirs%': [],
    'xmljs_libraries%': [],
  },
  'target_defaults': {
    'default_configuration': 'Release',
    'configurations': {
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 1, # static debug
          },
        },
      },
      'Release': {
        'defines': [ 'NDEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'defines': ['HAVE_CONFIG_H','LIBXSLT_STATIC','WITH_MODULES'],
    'include_dirs': [
      'libxslt/',
      # platform and arch-specific headers
      'libxslt.config/<(OS)/<(target_arch)',
      '<@(xmljs_include_dirs)'
    ]
  },
  'targets': [
    {
      'target_name': 'libxslt',
      'type': 'static_library',
      'sources': [
        'libxslt/libxslt/attributes.c',
        'libxslt/libxslt/attrvt.c',
        'libxslt/libxslt/documents.c',
        'libxslt/libxslt/extensions.c',
        'libxslt/libxslt/extra.c',
        'libxslt/libxslt/functions.c',
        'libxslt/libxslt/imports.c',
        'libxslt/libxslt/keys.c',
        'libxslt/libxslt/namespaces.c',
        'libxslt/libxslt/numbers.c',
        'libxslt/libxslt/pattern.c',
        'libxslt/libxslt/preproc.c',
        'libxslt/libxslt/preproc.h',
        'libxslt/libxslt/security.c',
        'libxslt/libxslt/security.h',
        'libxslt/libxslt/templates.c',
        'libxslt/libxslt/transform.c',
        'libxslt/libxslt/variables.c',
        'libxslt/libxslt/xslt.c',
        'libxslt/libxslt/xsltlocale.c',
        'libxslt/libxslt/xsltutils.c'
      ],
      'link_settings': {
        'libraries': [
          '<@(xmljs_libraries)',
        ]
      },
      'direct_dependent_settings': {
        'defines': ['LIBXSLT_STATIC'],
        'include_dirs': [
          'libxslt/',
          # platform and arch-specific headers
          'libxslt.config/<(OS)/<(target_arch)',
          '<@(xmljs_include_dirs)'
        ],
      }
    },
    {
      'target_name': 'libexslt',
      'type': 'static_library',
      'sources': [
        'libxslt/libexslt/common.c',
        'libxslt/libexslt/crypto.c',
        'libxslt/libexslt/date.c',
        'libxslt/libexslt/dynamic.c',
        'libxslt/libexslt/exslt.c',
        'libxslt/libexslt/functions.c',
        'libxslt/libexslt/math.c',
        'libxslt/libexslt/saxon.c',
        'libxslt/libexslt/sets.c',
        'libxslt/libexslt/strings.c'
      ],
      'dependencies': [
        'libxslt'
      ],
      'link_settings': {
        'libraries': [
          '<@(xmljs_libraries)'
        ]
      }
    }
  ]
}