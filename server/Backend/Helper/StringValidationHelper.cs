using System.Text.RegularExpressions;

namespace Backend.Helper
{
	public class StringValidationHelper
	{
		private static readonly Regex SerialRegex =
		new Regex("^[a-zA-Z0-9_-]+$", RegexOptions.Compiled);

		public static bool IsValid(string text)
		{
			return !string.IsNullOrWhiteSpace(text)
				   && SerialRegex.IsMatch(text);
		}
	}
}
