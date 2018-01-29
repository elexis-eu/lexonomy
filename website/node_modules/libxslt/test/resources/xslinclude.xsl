<?xml version='1.0'?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="xml" omit-xml-declaration="yes"/>

<xsl:template match="/">
   <xsl:for-each select="COLLECTION/BOOK">
      <xsl:apply-templates select="TITLE"/>
      <xsl:apply-templates select="AUTHOR"/>
      <xsl:apply-templates select="PUBLISHER"/>
      <BR/>  <!-- add this -->
   </xsl:for-each>
</xsl:template>

<!-- The following template rule will not be called,
  because the related template in the including stylesheet
  will be called. If we move this template so that
  it follows the xsl:include instruction, this one
  will be called instead.-->
<xsl:template match="TITLE">
  <DIV STYLE="color:blue">
    Title: <xsl:value-of select="."/>
  </DIV>
</xsl:template>

<xsl:include href="test/resources/xslincludefile.xsl" />

</xsl:stylesheet>