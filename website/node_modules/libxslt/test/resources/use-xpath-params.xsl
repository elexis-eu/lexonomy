<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="text" omit-xml-declaration="yes" indent="no"/>
  <!-- $at should be a xpath "string" parameter (not wrapped) and should result in a nodeset inside this xsl -->

  <xsl:template match="root">
    <xsl:value-of select="$testName"/>
    #selected nodes:<xsl:value-of select="count($at)"/>
    <xsl:apply-templates select="$at" mode="sel"/>
  </xsl:template>

  <xsl:template match="*" mode="sel">
    Node [<xsl:value-of select="name()"/> id:<xsl:value-of select="@id"/>] was selected.
  </xsl:template>

</xsl:stylesheet>
