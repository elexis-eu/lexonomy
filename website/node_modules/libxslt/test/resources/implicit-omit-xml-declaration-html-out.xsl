<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" indent="no"/>
  <xsl:template match="root">
    <xsl:text disable-output-escaping="yes"><![CDATA[<foo/>]]></xsl:text>
    <xsl:text disable-output-escaping="no"><![CDATA[<bar/>]]></xsl:text>
    <xsl:copy-of select="strong"/>
    <node>with text</node>
    <!-- comment on xslt -->
  </xsl:template>
</xsl:stylesheet>
