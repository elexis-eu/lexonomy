<?xml version='1.0'?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
      xml:space="preserve">

<xsl:template match="TITLE">
   Title - <xsl:value-of select="."/><BR/>
</xsl:template>

<xsl:template match="AUTHOR">
   Author - <xsl:value-of select="."/><BR/>
</xsl:template>

<xsl:template match="PUBLISHER">
   Publisher - <xsl:value-of select="."/><BR/><!-- removed second <BR/> -->
</xsl:template>

</xsl:stylesheet>