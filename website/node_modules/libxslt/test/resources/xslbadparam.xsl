<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:param name="MyParam"></xsl:param>

	<xsl:template match="/">
		<html>
			<body>
				<h2>My CD Collection</h2>
				<p><xsl:value-of select="$MyOtherParam"/></p>
      </body>
		</html>
	</xsl:template>
</xsl:stylesheet>
