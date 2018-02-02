<?xml version='1.0'?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="xml" omit-xml-declaration="yes"/>

<xsl:template match="/">
   <xsl:for-each select="COLLECTION/BOOK">
      <xsl:apply-templates select="TITLE"/>
   </xsl:for-each>
</xsl:template>

<xsl:include href="test/resources/THISFILEDOESNOTEXIST.xsl" />

</xsl:stylesheet>
